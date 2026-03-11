export const formatDZD=(a)=>{if(a==null)return '— DZD';return `${Math.round(a).toString().replace(/\B(?=(\d{3})+(?!\d))/g,' ')} DZD`}
export const parseDZD=(s)=>parseInt(s.replace(/[^\d]/g,''),10)
