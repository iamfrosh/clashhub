// Blocks phone numbers and external links in community chat (admin may bypass) to keep deals on-platform.
const PHONE=/(\+?\d[\s\-().]?){9,}/,LINK=/(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ng|me|gg|ly|co)\b|wa\.me|t\.me)/i;
export const violates=(t:string)=>PHONE.test(t)||LINK.test(t);
