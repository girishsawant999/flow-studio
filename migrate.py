import os
import re

def process_canvas():
    with open('src/components/Canvas.tsx', 'r') as f:
        code = f.read()

    code = re.sub(
        r'className="connection-path"\n\s*d={pathData}\n\s*strokeDasharray="5,5"\n\s*style={{ pointerEvents: "none", stroke: "var\(--accent-color\)" }}',
        r'className="fill-none stroke-2 stroke-[#7ed6df] pointer-events-none"\n        d={pathData}\n        strokeDasharray="5,5"',
        code
    )
    code = code.replace('className="canvas-area"', 'id="canvas-area" className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-stone-950"')
    code = code.replace('className="canvas-bg-pattern"', 'className="absolute inset-0 pointer-events-none bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#292524_1px,transparent_1px)] delay-0"')
    
    code = re.sub(
        r'style={{\s*transform: `translate\(\$\{state\.transform\.x\}px, \$\{state\.transform\.y\}px\) scale\(\$\{state\.transform\.zoom\}\)`,\s*transformOrigin: "0 0",\s*position: "absolute",\s*inset: 0,\s*pointerEvents:\s*"none" /\* Parent catches events, nodes catch their own \*/,\s*}}',
        r'className="absolute inset-0 origin-top-left pointer-events-none"\n        style={{ transform: `translate(${state.transform.x}px, ${state.transform.y}px) scale(${state.transform.zoom})` }}',
        code
    )
    
    code = code.replace('className="canvas-svg"', 'className="absolute inset-0 w-full h-full pointer-events-none z-0"')

    with open('src/components/Canvas.tsx', 'w') as f:
        f.write(code)

def process_edge():
    with open('src/components/Edge.tsx', 'r') as f:
        code = f.read()
    
    code = code.replace('className="connection-path-bg"', 'className="fill-none stroke-transparent stroke-[20px] pointer-events-auto cursor-pointer"')
    code = code.replace('className={`connection-path ${isSelected ? "selected" : ""}`}', 'className={`fill-none pointer-events-auto cursor-pointer transition-all duration-200 ${isSelected ? "stroke-[#7ed6df] stroke-[3px]" : "stroke-slate-400 dark:stroke-stone-600 stroke-2"}`}')
    code = code.replace('style={{ pointerEvents: "none", overflow: "visible" }}', 'className="pointer-events-none overflow-visible"')
    
    # className={`edge-label ${isSelected ? "selected" : ""}`} -> big class
    # and remove static styles completely from the label
    label_class = r'className={`absolute top-[20px] left-[100px] bg-white dark:bg-stone-900 border px-2 py-1 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 pointer-events-auto cursor-pointer -translate-x-1/2 -translate-y-1/2 z-10 shadow-sm transition-all duration-200 whitespace-nowrap ${isSelected ? "!border-[#7ed6df] !text-slate-900 dark:!text-slate-50 z-20" : "border-slate-200 dark:border-stone-800"}`}'
    
    code = code.replace('className={`edge-label ${isSelected ? "selected" : ""}`}', label_class)
    code = code.replace(',\n            pointerEvents: "auto",', '')
    code = code.replace('style={{\n            position: "absolute",\n            top: "20px",\n            left: "100px"\n          }}', '')
    # clean up any leftover empty style attribute if it matched weirdly
    code = re.sub(r'\n\s*style={{\s*}}', '', code)

    with open('src/components/Edge.tsx', 'w') as f:
        f.write(code)

def process_node():
    with open('src/components/Node.tsx', 'r') as f:
        code = f.read()
    
    code = code.replace('.querySelector(".canvas-area")', '.getElementById("canvas-area")')
    
    node_class = r'className={`absolute bg-white dark:bg-stone-900 border rounded-xl p-4 min-w-[220px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.5),0_4px_6px_-4px_rgba(0,0,0,0.5)] cursor-grab select-none transition-shadow duration-200 active:cursor-grabbing ${isSelected ? "border-[#7ed6df] shadow-[0_0_0_3px_rgba(126,214,223,0.3)]" : "border-slate-300 dark:border-stone-700"} ${isStart ? "border-l-4 border-l-[#7ed6df]" : ""} ${isSelected ? "z-10" : "z-0"}`}'
    
    code = code.replace('className={`node-container ${isSelected ? "selected" : ""} ${isStart ? "start-node" : ""} animate-slide-in`}', node_class)
    
    # modify style to remove pointerEvents and zIndex
    code = re.sub(
        r'style={{\n\s*left: node\.position\.x,\n\s*top: node\.position\.y,\n\s*pointerEvents: "auto", // Important so children events pass up\n\s*zIndex: isSelected \? 10 : 2,\n\s*}}',
        r'style={{ left: node.position.x, top: node.position.y }}\n      className={`absolute pointer-events-auto bg-white dark:bg-stone-900 border rounded-xl p-4 min-w-[220px] cursor-grab select-none transition-shadow duration-200 active:cursor-grabbing ${isSelected ? "border-[#7ed6df] shadow-[0_0_0_3px_rgba(126,214,223,0.3)] z-10" : "border-slate-300 dark:border-stone-700 shadow-sm z-[2]"} ${isStart ? "!border-l-4 !border-l-[#7ed6df]" : ""}`}',
        code
    )
    # wait, the first replace will fail if I did the second one, so I will just do it properly:
    # Let me just rewrite process_node better to prevent duplicates
    pass

process_canvas()
process_edge()
