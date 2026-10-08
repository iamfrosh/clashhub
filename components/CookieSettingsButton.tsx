"use client";
export default function CookieSettingsButton(){return <button className="hover:text-primary" onClick={()=>window.dispatchEvent(new Event("open-cookie-settings"))}>Cookie settings</button>;}
