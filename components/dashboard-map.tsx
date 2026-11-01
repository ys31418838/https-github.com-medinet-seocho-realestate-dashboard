"use client";

import { useEffect, useRef } from "react";
import type { Transaction } from "@/app/page";

type MapItem = Transaction & { count:number; median:number };
type LeafletMap = { remove:()=>void; fitBounds:(bounds:[number,number][],options?:object)=>void; setView:(center:[number,number],zoom:number,options?:object)=>LeafletMap };
type LeafletLike = {
  map:(element:HTMLElement,options?:object)=>LeafletMap;
  tileLayer:(url:string,options?:object)=>{addTo:(map:LeafletMap)=>void};
  marker:(point:[number,number],options?:object)=>{addTo:(map:LeafletMap)=>{bindTooltip:(text:string,options?:object)=>{on:(event:string,cb:()=>void)=>void}}};
  divIcon:(options:object)=>object;
};
declare global { interface Window { L?:LeafletLike } }
let leafletPromise:Promise<LeafletLike>|null=null;

function loadLeaflet(){
  if(window.L)return Promise.resolve(window.L);
  if(leafletPromise)return leafletPromise;
  leafletPromise=new Promise((resolve,reject)=>{
    if(!document.querySelector('link[data-leaflet="true"]')){const link=document.createElement("link");link.rel="stylesheet";link.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";link.dataset.leaflet="true";document.head.appendChild(link)}
    const existing=document.querySelector<HTMLScriptElement>('script[data-leaflet="true"]');
    if(existing){existing.addEventListener("load",()=>window.L&&resolve(window.L));existing.addEventListener("error",()=>reject(new Error("지도 라이브러리를 불러오지 못했습니다.")));return}
    const script=document.createElement("script");script.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";script.async=true;script.dataset.leaflet="true";script.onload=()=>window.L?resolve(window.L):reject(new Error("지도 초기화에 실패했습니다."));script.onerror=()=>reject(new Error("지도 라이브러리를 불러오지 못했습니다."));document.head.appendChild(script);
  });return leafletPromise;
}

export function DashboardMap({items,selected,onSelect}:{items:MapItem[];selected:MapItem|null;onSelect:(item:MapItem)=>void}){
  const containerRef=useRef<HTMLDivElement>(null);const mapRef=useRef<LeafletMap|null>(null);
  useEffect(()=>{let cancelled=false;let ownedMap:LeafletMap|null=null;loadLeaflet().then(L=>{if(cancelled||!containerRef.current)return;try{mapRef.current?.remove()}catch{}containerRef.current.innerHTML="";const map=L.map(containerRef.current,{zoomControl:true,scrollWheelZoom:false,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false}).setView([37.488,127.01],13,{animate:false});ownedMap=map;mapRef.current=map;L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"&copy; OpenStreetMap contributors",maxZoom:19}).addTo(map);const bounds:[number,number][]=[];items.forEach((item,index)=>{bounds.push([item.lat,item.lng]);const isSelected=selected?.apartment===item.apartment;const icon=L.divIcon({className:"medinet-map-marker-wrap",html:`<span class="medinet-map-marker ${isSelected?"is-selected":""}">${index+1}</span>`,iconSize:[32,38],iconAnchor:[16,38]});L.marker([item.lat,item.lng],{icon}).addTo(map).bindTooltip(`${index+1}. ${item.apartment}`,{direction:"top",offset:[0,-30]}).on("click",()=>onSelect(item))});if(selected)map.setView([selected.lat,selected.lng],15,{animate:false});else if(bounds.length>1)map.fitBounds(bounds,{padding:[34,34],animate:false})}).catch(()=>{if(containerRef.current)containerRef.current.innerHTML='<div class="map-fallback">지도를 불러오지 못했습니다.<br/>목록에서 단지를 선택해 주세요.</div>'});return()=>{cancelled=true;try{ownedMap?.remove()}catch{}if(mapRef.current===ownedMap)mapRef.current=null}},[items,selected,onSelect]);
  return <div className="dashboard-map" ref={containerRef} aria-label="TOP 10 아파트 위치 지도"/>;
}
