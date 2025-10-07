import domToImage from "dom-to-image-more";

export const exportCanvasAsPng = async (element: HTMLElement, filename: string) => {
  const blob = await domToImage.toBlob(element, {
    filter: (node) => !(node as HTMLElement).dataset?.noexport
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  anchor.click();
  URL.revokeObjectURL(url);
};
