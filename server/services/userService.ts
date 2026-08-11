import mapToUserDto from "#dtos/userDto.ts";
import ApiError from "#errors/ApiError.ts";
import { type Token, type User } from "#generated/prisma/client.ts";
import getRoomSockets from "#services/getRoomSockets.ts";
import prisma from "#services/prisma.ts";
import TokenService from "#services/tokenService.ts";
import type { IOSocket } from "#types/socket.ts";
import { PASSWORD_HASH_SALT, TEST_PASSWORD_HASH_SALT } from "#utils/consts.ts";
import getRoomIdOfUser from "#utils/getRoomIdOfUser.ts";
import getUserRoom from "#utils/getUserRoom.ts";
import createIO from "#utils/io.ts";
import userToJwtPayload from "#utils/userToJwtPayload.ts";
import {
  blobToBase64,
  generateLetterPictureBlob,
  getNameInitials,
  SocketEvents,
  type UserDataWithTokens,
  type UserDto,
} from "@speak-up/shared";
import bcrypt from "bcrypt";

class UserService {
  // just a service's helper
  static async generateUserDataWithTokens(
    user: User,
  ): Promise<UserDataWithTokens> {
    const payload = userToJwtPayload(user);

    const tokens = await TokenService.generateTokens(payload);
    await TokenService.saveToken(tokens.refreshToken, user.id);

    const userDto = mapToUserDto(user);
    const userData = {
      tokens,
      user: userDto,
    };

    return userData;
  }

  static async generateLetterPictureWithError(
    nickname: string,
  ): Promise<string> {
    const letterPictureBlob = await generateLetterPictureBlob(nickname);
    if (!letterPictureBlob) {
      // let the error middleware pick it up as 500
      throw new Error("Letter picture generation is failed");
    }

    // save pictures as a stinky Base64 string because i don't want
    // to spend time on setting up s3 (this project is not about this)
    const letterPicture = await blobToBase64(letterPictureBlob);
    return letterPicture;
  }

  static async register(
    nickname: string,
    username: string,
    password: string,
  ): Promise<UserDataWithTokens> {
    const usernameCandidate = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (usernameCandidate) {
      throw ApiError.BadRequest("User with such a username already exists");
    }

    const salt =
      process.env.NODE_ENV === "test"
        ? TEST_PASSWORD_HASH_SALT
        : PASSWORD_HASH_SALT;

    const hashPassword = await bcrypt.hash(password, salt);
    const letterPicture =
      await UserService.generateLetterPictureWithError(nickname);

    const picture = letterPicture;
    const user = await prisma.user.create({
      data: {
        username,
        nickname,
        picture,
        letterPicture,
        password: hashPassword,
      },
    });

    const userData = await UserService.generateUserDataWithTokens(user);
    return userData;
  }

  static async login(
    username: string,
    password: string,
  ): Promise<UserDataWithTokens> {
    const usernameCandidate = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!usernameCandidate) {
      throw ApiError.BadRequest("User with such a username doesn't exist");
    }

    const isPasswordEqual = await bcrypt.compare(
      password,
      usernameCandidate.password,
    );

    if (!isPasswordEqual) {
      throw ApiError.BadRequest("Invalid password");
    }

    const userData =
      await UserService.generateUserDataWithTokens(usernameCandidate);

    return userData;
  }

  static async logout(refreshToken: string | undefined): Promise<Token | null> {
    if (!refreshToken) return null;

    const token = await prisma.token.delete({ where: { refreshToken } });
    return token;
  }

  static async changeNickname(
    nickname: string,
    userId: string,
  ): Promise<UserDto> {
    const oldUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { nickname: true },
    });

    if (!oldUser) {
      throw ApiError.BadRequest("Such a user doesn't exist");
    }

    const oldInitials = getNameInitials(oldUser.nickname);
    const newInitials = getNameInitials(nickname);

    const haveInitialsBeenChanged = newInitials !== oldInitials;
    const newPictureUrl =
      await UserService.generateLetterPictureWithError(nickname);

    const picture = haveInitialsBeenChanged ? newPictureUrl : undefined;
    const letterPicture = haveInitialsBeenChanged ? newPictureUrl : undefined;

    const newUser = await prisma.user.update({
      where: { id: userId },
      data: {
        nickname,
        picture,
        letterPicture,
      },
    });

    async function socketCb(): Promise<void> {
      // error here shouldn't affect the whole endpoint
      try {
        const io = createIO();
        if (!io) throw new Error("Ignore");

        const userRoom = getUserRoom(userId);
        const userSockets = await getRoomSockets(io, userRoom);

        if (!userSockets.length) throw new Error("Ignore");
        const roomId = await getRoomIdOfUser(
          io,
          userSockets[0] as IOSocket<true>,
        );

        const targetRooms = [...userSockets.map(socket => socket.id)];
        if (roomId) targetRooms.push(roomId);

        io.to(targetRooms).emit(SocketEvents.CHANGED_NICKNAME, {
          userId,
          nickname,
          picture,
          letterPicture,
        });
      } catch {}
    }

    socketCb(); // don't wait for it's end

    const userDto = mapToUserDto(newUser);
    return userDto;
  }

  static async refresh(
    refreshToken: string | undefined,
  ): Promise<UserDataWithTokens> {
    if (!refreshToken) throw ApiError.UnauthorizedError();

    const payload = await TokenService.validateRefreshToken(refreshToken);
    if (!payload) throw ApiError.UnauthorizedError();

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) throw ApiError.UnauthorizedError();

    const userData = await UserService.generateUserDataWithTokens(user);
    return userData;
  }
}

export default UserService;
