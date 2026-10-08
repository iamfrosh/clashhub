"use client";
import {use} from "react";import ProfileView from "@/components/ProfileView";
export default function PublicProfile({params}:{params:Promise<{username:string}>}){const {username}=use(params);return <ProfileView username={username}/>;}
