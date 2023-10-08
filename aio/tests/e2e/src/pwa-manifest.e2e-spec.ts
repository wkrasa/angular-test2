import { PwaManifestPage, PwaShortcutItem } from './pwa-manifest.po';


describe('PWA manifest', () => {
  const page = new PwaManifestPage();

  describe('shortcuts', () => {
    let shortcuts: PwaShortcutItem[];

    // Helpers
    const pageExists = async (url: string) => {
      await page.navigateTo(url);
      const content = await page.getDocViewerText();
      return !/page not found/i.test(content);
    };

    beforeEach(async () => {
      shortcuts = await page.getPwaShortcuts();
    });

    it('should exist', async () => {
      for (const {short_name, url} of shortcuts) {
        // In Jasmine, passing an `expectationFailOutput` to the `toBe()` method is deprecated in
        // favor of using the `.withContext()` matcher. However, JasmineWD does not support that.
        // tslint:disable-next-line: deprecation
        expect(await pageExists(url)).toBe(
            true,
            `Page for shortcut '${short_name}' (from '${page.pwaManifestUrl}') does not exist. (URL: ${url})`);
      }
    });
  });
});
