export default {
  mounted(el, binding) {
    if (!binding.value) return
    el.addEventListener('click', () => {
      copyToClipboard(binding.value)
    })
  }
}

function copyToClipboard(text) {
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => {
        ElMessage.success('Copied')
      })
      .catch(() => {
        ElMessage.warning('Copy Failed')
      });
  } else {
    fallbackCopyText(text);
  }
}
function fallbackCopyText(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';  // avoid scrolling
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    ElMessage.success('Copied')
  } catch (err) {
    console.error('Fallback copy failed', err);
    ElMessage.warning('Copy Failed')
  }
  document.body.removeChild(textarea);
}

