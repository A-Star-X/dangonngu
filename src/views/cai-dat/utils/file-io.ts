// @spec S8-05
/** Tải file xuất và đọc file nhập. Bọc trong đối tượng để test thay được. */
export const fileIO = {
  download(name: string, text: string) {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
  read(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result ?? ''));
      r.onerror = () => reject(r.error);
      r.readAsText(file);
    });
  },
};

/** S8-05: gõ đúng tên ngôn ngữ, không phân biệt hoa thường nhưng phải đủ dấu. */
export const sameName = (a: string, b: string) =>
  a.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi') === b.normalize('NFC').trim().toLocaleLowerCase('vi');
