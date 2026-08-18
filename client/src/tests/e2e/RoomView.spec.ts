import mockAuthUser from "@/tests/e2e/services/mockAuthUser";
import setupE2EFakeBrowserMediaEngine from "@/tests/e2e/services/setupE2EFakeBrowserMediaEngine";
import { mockRoomId } from "@/tests/e2e/utils/consts";
import { test } from "@/tests/e2e/utils/test";
import { RoutesWithoutParams } from "@/types/routes";
import {
  memberListId,
  memberListToggleId,
  roomChatId,
  roomChatInputId,
  roomChatToggleId,
} from "@/utils/idConsts";
import { expect, type Locator, type Page } from "@playwright/test";

test.describe("RoomView", () => {
  async function joinRoom(page: Page): Promise<void> {
    // do it in the natural way, so we don't have to recreate
    // "join" event handler here
    await setupE2EFakeBrowserMediaEngine(page);
    await page.goto(RoutesWithoutParams.HOME);

    const submitButton = page.getByRole("button", { name: "Join" });
    const input = page.locator('input[name="id"]');

    await input.fill(mockRoomId);
    await input.blur();

    await submitButton.click();
    await expect(page).toHaveURL(RoutesWithoutParams.ROOM);
  }

  test.beforeEach(async ({ page }) => await mockAuthUser(page));
  test.beforeEach(async ({ page }) => await joinRoom(page));

  test("should properly manage invisible focus buttons and (un)pin members feature", async ({
    page,
    isMobile,
  }) => {
    test.setTimeout(60000); // webkit is way too slow for me

    async function testFocus(
      focusButton: Locator,
      elemToBeFocused: Locator,
    ): Promise<void> {
      await focusButton.focus();
      await focusButton.press("Enter");

      await expect(elemToBeFocused).toBeFocused();
    }

    const header = page.getByRole("banner").first();
    const main = page.getByRole("main").first();
    const footer = page.getByRole("contentinfo").first();

    const firstHeaderButton = header.getByRole("button").nth(1);
    const firstFooterButton = footer
      .locator('button:not([data-invisible-focus="true"])')
      .first();

    const pinnedCards = main.locator(
      '[data-pinned-member-cards="true"] > li > section',
    );

    const unpinnedCards = main.locator(
      '[data-unpinned-member-cards="true"] > li > section',
    );

    expect((await unpinnedCards.all()).length).toBe(2);

    const headerFocusButton = page.getByRole("button", {
      name: "Skip to the main content",
    });

    const backToHeaderFocusButton = page.getByRole("button", {
      name: "Go back to the header",
    });

    const goToActionsFocusButton = page.getByRole("button", {
      name: "Skip to the actions",
    });

    const backToMainFocusButton = page.getByRole("button", {
      name: "Go back to the main content",
    });

    const chatFocusButton = page.getByRole("button", {
      name: "Skip to the chat",
    });

    const memberListFocusButton = page.getByRole("button", {
      name: "Skip to the member list",
    });

    const chatStartFocusButton = page.getByRole("button", {
      name: "Go to the start of the chat",
    });

    const memberListStartFocusButton = page.getByRole("button", {
      name: "Go to the start of the member list",
    });

    const backToActionsFocusButton = page.getByRole("button", {
      name: "Go back to the actions",
    });

    const unpinnedFocusButton = page.getByRole("button", {
      name: "Skip to the unpinned members",
    });

    const backToPinnedFocusButton = page.getByRole("button", {
      name: "Go back to the pinned members",
    });

    await expect(chatFocusButton).not.toBeAttached();
    await expect(memberListFocusButton).not.toBeAttached();
    await expect(chatStartFocusButton).not.toBeAttached();
    await expect(memberListStartFocusButton).not.toBeAttached();
    await expect(backToActionsFocusButton).not.toBeAttached();
    await expect(unpinnedFocusButton).not.toBeAttached();
    await expect(backToPinnedFocusButton).not.toBeAttached();

    await testFocus(headerFocusButton, goToActionsFocusButton);
    await testFocus(backToHeaderFocusButton, firstHeaderButton);
    await testFocus(goToActionsFocusButton, firstFooterButton);
    await testFocus(backToMainFocusButton, unpinnedCards.first());

    await unpinnedCards.first().locator('button[aria-label="Pin"]').click();

    await expect(pinnedCards).toHaveCount(1);
    await expect(unpinnedCards).toHaveCount(1);

    await expect(unpinnedFocusButton).toBeAttached();
    await expect(backToPinnedFocusButton).toBeAttached();

    await testFocus(backToMainFocusButton, pinnedCards.first());
    await testFocus(unpinnedFocusButton, unpinnedCards.first());
    await testFocus(backToPinnedFocusButton, pinnedCards.first());

    await unpinnedCards.first().focus();
    await unpinnedCards
      .first()
      .locator('button[aria-label="Pin"]')
      .click({ force: true });

    await expect(pinnedCards).toHaveCount(2);
    await expect(unpinnedCards).toHaveCount(0);

    await expect(unpinnedFocusButton).not.toBeAttached();
    await expect(backToPinnedFocusButton).not.toBeAttached();

    await testFocus(backToMainFocusButton, pinnedCards.first());

    await pinnedCards.first().focus();
    await pinnedCards.first().locator('button[aria-label="Unpin"]').click();

    await expect(pinnedCards).toHaveCount(1);
    await expect(unpinnedCards).toHaveCount(1);

    await pinnedCards.first().focus();
    await pinnedCards.first().locator('button[aria-label="Unpin"]').click();

    expect((await pinnedCards.all()).length).toBe(0);
    expect((await unpinnedCards.all()).length).toBe(2);

    if (isMobile) return;
    const chatViewport = page.locator(
      `#${roomChatId} [data-reka-scroll-area-viewport]`,
    );

    const memberListViewport = page.locator(
      `#${memberListId} [data-reka-scroll-area-viewport]`,
    );

    const chatInput = page.locator(`[data-id="${roomChatInputId}"]`);

    const chatToggle = page.locator(`#${roomChatToggleId}`);
    await chatToggle.click();

    await expect(backToActionsFocusButton).toBeAttached();
    await expect(chatFocusButton).toBeAttached();
    await expect(chatStartFocusButton).toBeAttached();
    await expect(memberListFocusButton).not.toBeAttached();
    await expect(memberListStartFocusButton).not.toBeAttached();

    await testFocus(backToActionsFocusButton, firstFooterButton);
    await testFocus(chatStartFocusButton, chatViewport);
    await testFocus(chatFocusButton, chatInput);

    const memberListToggle = page.locator(`#${memberListToggleId}`);
    await memberListToggle.click();

    await expect(backToActionsFocusButton).toBeAttached();
    await expect(memberListFocusButton).toBeAttached();
    await expect(memberListStartFocusButton).toBeAttached();
    await expect(chatFocusButton).not.toBeAttached();
    await expect(chatStartFocusButton).not.toBeAttached();

    await testFocus(memberListStartFocusButton, memberListViewport);
    await testFocus(backToActionsFocusButton, firstFooterButton);
    await testFocus(memberListFocusButton, memberListViewport);
  });
});
