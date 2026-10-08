// Branded 600px template: white body, thin indigo bar, one indigo button.
export const layout=(o:{heading:string;body:string;cta?:{label:string;url:string};marketing?:boolean})=>`<!doctype html><html><body style="margin:0;background:#F7F8FA;font-family:Inter,Arial,sans-serif;color:#141824">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="height:6px;background:#5B4CFF"></td></tr>
<tr><td style="padding:32px"><p style="font:700 20px Sora,Arial,sans-serif;color:#5B4CFF;margin:0 0 24px">ClashHub</p>
<h1 style="font:600 24px Sora,Arial,sans-serif;margin:0 0 12px">${o.heading}</h1>
<p style="font-size:16px;line-height:1.5;color:#141824;margin:0 0 24px">${o.body}</p>
${o.cta?`<a href="${o.cta.url}" style="display:inline-block;background:#5B4CFF;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:500">${o.cta.label}</a>`:""}
</td></tr><tr><td style="padding:16px 32px;background:#F7F8FA;font-size:12px;color:#6B7280">Need help? Reply to this email or contact ClashHub Support.${o.marketing?` <a href="${process.env.CLIENT_URL}/settings" style="color:#5B4CFF">Unsubscribe</a>`:""}</td></tr>
</table></td></tr></table></body></html>`;
