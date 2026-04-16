import { useState } from "react";
import { C } from "../systems/theme";
import { Ic } from "../icons/Ic";

export function Field({label,type="text",value,onChange,error,placeholder}){
  const[show,setShow]=useState(false);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {label&&<label style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,fontFamily:"Georgia,serif"}}>{label}</label>}
      <div style={{position:"relative"}}>
        <input
          className="life-field-input"
          type={type==="password"?(show?"text":"password"):type}
          value={value}
          onChange={e=>onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width:"100%",
            background:C.white,
            border:`1.5px solid ${error?C.red:C.border}`,
            borderRadius:12,
            padding:type==="password"?"16px 50px 16px 16px":"16px",
            color:C.ink,
            fontSize:15,
            outline:"none",
            fontFamily:"Georgia,serif",
            boxSizing:"border-box"
          }}
        />
        {type==="password"&&(
          <button
            className="life-password-toggle"
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={()=>setShow(!show)}
            style={{
              position:"absolute",
              right:14,
              top:"50%",
              transform:"translateY(-50%)",
              background:"transparent",
              border:"none",
              cursor:"pointer",
              color:C.muted,
              fontSize:12
            }}
          >
            {show?"Hide":"Show"}
          </button>
        )}
      </div>
      {error&&<span className="life-field-error" style={{fontSize:12,color:C.red,fontFamily:"Georgia,serif",fontStyle:"italic"}}>{error}</span>}
    </div>
  );
}

export function TreeNode({nodeKey,node,depth=0,onSelect,onFolderSelect,selectedKey,defaultOpen=false,play,theme}){
  const[open,setOpen]=useState(defaultOpen);
  const th=theme||C;

  const hasChildren=node.children&&Object.keys(node.children).length>0;
  const isLeaf=!!node.content;
  const isSel=selectedKey===nodeKey;
  const isTop=depth===0;

  const paddingLeft = 14 + depth * -0.5 * -5; // Base padding + incremental padding per depth

  return(
    <div>
      <button
        onClick={()=>{
          if(isLeaf){
            play("open");
            onSelect(nodeKey,node);
          }else{
            if(onFolderSelect && depth <= 1){
              play("tap");
              onFolderSelect(nodeKey,node);
            }
            setOpen(!open);
          }
        }}
        style={{
          display:"flex",
          alignItems:"center",
          gap:0,
          width:"100%",

          paddingTop:isTop?14:11,
          paddingBottom:isTop?14:11,
          paddingLeft:paddingLeft,
          paddingRight:10,

          background:isSel?th.greenLt:"transparent",
          border:"none",
          borderLeft:isSel?`3px solid ${th.green}`:"3px solid transparent",

          cursor:"pointer",
          color:isTop?th.ink:depth===1?th.mid:th.muted,
          fontSize:isTop?15:depth===1?14:13,
          fontWeight:isTop?700:depth===1?500:400,

          textAlign:"left",
          fontFamily:"Georgia,serif",
          lineHeight:1.4
        }}
      >

        {/* ICON FIX */}
        {node.icon && (isTop || depth <= 3) && (
          <span
            style={{
              width:20,
              minWidth:20,
              display:"flex",
              alignItems:"center",
              justifyContent:"flex-start",
              marginRight:6,
              opacity:isTop?1:0.75
            }}
          >
            {Ic[node.icon]
              ? Ic[node.icon]("none", isTop?th.green:th.muted, 16)
              : <span style={{fontSize:14,lineHeight:1}}>{node.icon}</span>
            }
          </span>
        )}

        <span style={{flex:1}}>{node.label}</span>

        {hasChildren&&(
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            style={{
              marginRight:8,
              flexShrink:0,
              transform:open?"rotate(90deg)":"none",
              transition:"transform 0.2s"
            }}
          >
            <polyline
              points="2,2 8,5 2,8"
                fill="none"
                stroke={th.muted}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {hasChildren&&open&&(
        <div
          style={{
            borderLeft:`1px solid ${th.border}`,
            marginLeft:paddingLeft+9
          }}
        >
          {Object.entries(node.children).map(([k,child])=>(
            <TreeNode
              key={k}
              nodeKey={k}
              node={child}
              depth={depth+1}
              onSelect={onSelect}
              onFolderSelect={onFolderSelect}
              selectedKey={selectedKey}
              play={play}
              theme={th}
            />
          ))}
        </div>
      )}
    </div>
  );
}
