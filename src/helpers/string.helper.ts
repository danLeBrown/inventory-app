export function slugify(value: string) {
  // Replace spaces with hyphens
  // Remove all non-word characters
  return value
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(/[^\w-]+/g, '');
}

export function unSlugify(value: string) {
  // Replace underscores with spaces
  // Remove all non-word characters
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/[^\w\s]+/g, '');
}

export function capitalizeWord(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function capitalizeWords(words: string, separator = ' ') {
  return words
    .split(separator)
    .map((word) => capitalizeWord(word))
    .join(' ');
}

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\b(mr|mrs|ms|dr|prof)\b/g, '') // Remove titles
    .replace(/\bjr\b|\bsr\b|\biii?\b/g, '') // Remove suffixes like Jr, Sr, II, III
    .trim();
}
