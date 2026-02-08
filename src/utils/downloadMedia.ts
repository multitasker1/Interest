export const forceDownload = async (url: string, filename: string) => {
  try {
    // Attempt 1: Fetch as a Blob to force a true download
    // This works perfectly for data: URIs (uploaded files) and CORS-enabled external links
    const response = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!response.ok) throw new Error("CORS or Network issue");
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Cleanup memory
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    return true;
  } catch (err) {
    console.warn("Direct blob download failed, falling back to anchor download", err);
    try {
      // Attempt 2: Fallback anchor method without target="_blank"
      // If the server supports the Content-Disposition header, this forces a download.
      // If it doesn't, we still trigger the anchor tag and append `download`.
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    } catch (fallbackErr) {
      console.error("All download attempts failed.", fallbackErr);
      return false;
    }
  }
};
