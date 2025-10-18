export const formatChapterName = (chapterLink: string): string => {
  const parts = chapterLink.split('/');
  const chapterLinkName = parts[parts.length - 1];
  const chapterNumParts = chapterLinkName.split('-').slice(1).join('.');

  return `Chapter ${chapterNumParts}`;
};
