export function getResponsiveDialogWidth(): string {
  const screenWidth = window.innerWidth;
  if (screenWidth > 1200) return '900px';
  if (screenWidth > 992) return '700px';
  if (screenWidth > 768) return '600px';
  return '90vw';
}