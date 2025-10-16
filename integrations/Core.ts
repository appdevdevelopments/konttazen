export const UploadFile = async ({ file }: { file: File }): Promise<{ file_url: string }> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, this would upload the file and return a URL.
  // Here, we create a temporary local URL from the file object to preview it.
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ file_url: reader.result as string });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
