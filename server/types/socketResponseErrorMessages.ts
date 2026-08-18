export const enum SocketResponseErrorMessages {
  INVALID_DATA = "Invalid data",
  NOT_INSIDE_ANY_ROOM = "You are not inside any room",
  ROOM_DOESNT_EXIST = "Such a room doesn't exist",
  USER_NOT_INSIDE_ROOM = "Such a user isn't inside the room",
  CANT_JOIN_ROOM = "You can't join this room",
  CANT_SEND_MESSAGE_TO_OTHER_ROOM = "You can't send a message to the other room",
  CANT_REMOVE_YOURSELF = "You can't remove yourself",
  CANT_CREATE_CONNECTION_WITH_YOURSELF = "You can't create a connection with yourself",
  CANT_CREATE_NON_MAIN_CONNECTION = "You can't create a connection from a non-main tab",
  FULL_ROOM = "The room is full",
  NOT_HOST = "You are not the host of this room",
  UNEXPECTED_ERROR = "Unexpected error. Try a bit later",
}
