export function sanitize(input){
  if(typeof input !== 'string') return ''
  return input.replace(/[&<>\"']/g, function(ch){
    return ({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    })[ch]
  })
}

export async function hashString(str){
  if(!str) return ''
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('')
}
