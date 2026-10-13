# usage: python3 composite_logo.py generated_1280x720.png out_640x360.png [scale=2] [x_center=320] [y=16] [glow=1]
import sys
from pathlib import Path
from PIL import Image, ImageFilter
src,out=sys.argv[1],sys.argv[2]; sc=int(sys.argv[3]) if len(sys.argv)>3 else 2
cx=int(sys.argv[4]) if len(sys.argv)>4 else 320; y=int(sys.argv[5]) if len(sys.argv)>5 else 16; gl=int(sys.argv[6]) if len(sys.argv)>6 else 1
bg=Image.open(src).convert('RGB').resize((640,360),Image.LANCZOS).convert('RGBA')
lg=Image.open(Path(__file__).with_name('logo_1x.png')).convert('RGBA'); lg=lg.resize((lg.width*sc,lg.height*sc),Image.NEAREST)
x=cx-lg.width//2
if gl:
    a=lg.split()[3].filter(ImageFilter.GaussianBlur(10)); g=Image.new('RGBA',lg.size,(255,190,80,0)); g.putalpha(a.point(lambda v:int(v*.55)))
    bg.alpha_composite(g,(x,y))
bg.alpha_composite(lg,(x,y)); bg.convert('RGB').save(out); print(out,lg.size)
