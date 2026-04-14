export const LS = {
  get:(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{/* quota / private mode */}},
  del:(k)=>{try{localStorage.removeItem(k);}catch{/* ignore */}},
};
