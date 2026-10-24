// The site's data and settings in one import: who it is about, its pages and
// settings, the About content, the gallery and the protected routes.
export { profile, profileLinks } from "./profile";
export type { Profile, ProfileLink } from "./profile";
export { enabledRoutes, headerShows, pages, sameAs, sharing, siteUrl } from "./site";
export type { Page, PagePath } from "./site";
export { about } from "./about";
export { homeCopy } from "./home";
export { galleryPieces } from "./gallery";
export { protectedRoutes } from "./protectedRoutes";
