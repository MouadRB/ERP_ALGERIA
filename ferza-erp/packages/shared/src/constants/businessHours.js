export const BUSINESS_HOURS={workDays:[0,1,2,3,4],friday:{start:8,end:12},normal:{start:8,end:18},saturday:null,SOFT_RESERVATION_MINUTES:120}
export const isBusinessHour=(date=new Date())=>{const d=date.getDay(),h=date.getHours();if(d===5)return h>=8&&h<12;if(d===6)return false;return h>=8&&h<18}
