from PIL import Image, ImageDraw, ImageFont
import json
import math

# Config
GRID = 70
CELL = 10  # pixels per block
IMG_SIZE = GRID * CELL
BG_COLOR = (30, 30, 30)
GRID_COLOR = (50, 50, 50)
MACHINE_COLOR = (70, 130, 180)
PAC_COLOR = (200, 120, 50)
PYLON_COLOR = (200, 200, 60)
PYLON_RANGE_COLOR = (200, 200, 60, 60)
CONV_COLOR = (220, 220, 220)
TEXT_COLOR = (255, 255, 255)

# Load data
with open('machines.json','r',encoding='utf-8') as f:
    machines = json.load(f)

with open('recipes.json','r',encoding='utf-8') as f:
    recipes = json.load(f)

with open('energy.json','r',encoding='utf-8') as f:
    energy = json.load(f)

# Parse dimension string like '4x6'
def parse_dim(s):
    w,h = s.split('x')
    return int(w), int(h)

# Simple placement: center PAC tower, then place required machines in rings
img = Image.new('RGBA', (IMG_SIZE, IMG_SIZE), BG_COLOR)
d = ImageDraw.Draw(img)

# draw grid
for x in range(0, IMG_SIZE, CELL):
    d.line([(x,0),(x,IMG_SIZE)], fill=GRID_COLOR)
for y in range(0, IMG_SIZE, CELL):
    d.line([(0,y),(IMG_SIZE,y)], fill=GRID_COLOR)

# font
try:
    font = ImageFont.truetype('arial.ttf', 10)
except Exception:
    font = ImageFont.load_default()

placements = []  # tuples of (name,x,y,w,h,color)
occupied = [[False]*GRID for _ in range(GRID)]

# helper to mark occupied
def occupy(x,y,w,h,name):
    for i in range(x, x+w):
        for j in range(y, y+h):
            if 0 <= i < GRID and 0 <= j < GRID:
                occupied[j][i] = True
    placements.append((name,x,y,w,h))

# place PAC tower near center (8x8)
pac_w, pac_h = 8,8
pac_x = (GRID - pac_w)//2
pac_y = (GRID - pac_h)//2
occupy(pac_x,pac_y,pac_w,pac_h,'PAC_Tower')

# function to find next free spot scanning left-to-right, top-to-bottom
def find_spot(w,h,start_row=0):
    for y in range(start_row, GRID - h + 1):
        for x in range(0, GRID - w + 1):
            ok = True
            for i in range(x, x+w):
                for j in range(y, y+h):
                    if occupied[j][i]:
                        ok = False
                        break
                if not ok:
                    break
            if ok:
                return x,y
    return None

# List of machine types we want to place for Buck Capsule A and battery production
desired = [
    'Planting_Unit','Seed-picking_Unit',
    'Shredding_Unit','Grinding_Unit','Refining_Unit',
    'Fitting_Unit','Moudling_Unit','Filling_Unit','Packaging_Unit',
    'Thermal_Bank','Electric_Pylon','Protocol_Stash',
    'Depot_Loader','Depot_Unloader','Converger','Splitter'
]

# Ensure unique
placed_names = set(['PAC_Tower'])
row_start = 0
for m in desired:
    if m not in machines:
        continue
    dim = machines[m]['dimension']
    w,h = parse_dim(dim)
    spot = find_spot(w,h,row_start)
    if not spot:
        # try next rows
        spot = find_spot(w,h,0)
    if spot:
        x,y = spot
        occupy(x,y,w,h,m)
        row_start = y

# Place a ring of electric pylons covering area roughly evenly
pylon_w, pylon_h = parse_dim(machines['Electric_Pylon']['dimension'])
# We'll place 4 pylons near corners of central area
pylon_positions = [ (5,5), (GRID-7,5), (5,GRID-7), (GRID-7,GRID-7) ]
for i,(px,py) in enumerate(pylon_positions):
    # if occupied, find nearby
    if occupied[py][px]:
        spot = find_spot(pylon_w,pylon_h)
        if spot:
            px,py = spot
    occupy(px,py,pylon_w,pylon_h,f'Electric_Pylon_{i+1}')

# draw machines
for name,x,y,w,h in placements:
    x0 = x*CELL
    y0 = y*CELL
    x1 = (x+w)*CELL
    y1 = (y+h)*CELL
    if name == 'PAC_Tower':
        color = PAC_COLOR
    elif name.startswith('Electric_Pylon'):
        color = PYLON_COLOR
    else:
        color = MACHINE_COLOR
    d.rectangle([x0,y0,x1,y1], fill=color, outline=(0,0,0))
    # label
    label = name.replace('_',' ')
    try:
        text_w, text_h = font.getsize(label)
    except Exception:
        # fallback
        bbox = d.textbbox((0,0), label, font=font)
        text_w = bbox[2]-bbox[0]
        text_h = bbox[3]-bbox[1]
    # center label
    tx = x0 + (x1-x0-text_w)/2
    ty = y0 + (y1-y0-text_h)/2
    d.text((tx,ty), label, fill=TEXT_COLOR, font=font)

# draw pylon ranges (12x12 area), centered on pylon center 2x2
PYLON_RANGE = 12
for name,x,y,w,h in placements:
    if name.startswith('Electric_Pylon'):
        # center of pylon in blocks
        cx = x + w/2
        cy = y + h/2
        # range area top-left in blocks
        rx = int(cx - PYLON_RANGE/2)
        ry = int(cy - PYLON_RANGE/2)
        rx0 = max(0, rx*CELL)
        ry0 = max(0, ry*CELL)
        rx1 = min(IMG_SIZE, (rx+PYLON_RANGE)*CELL)
        ry1 = min(IMG_SIZE, (ry+PYLON_RANGE)*CELL)
        d.rectangle([rx0,ry0,rx1,ry1], outline=PYLON_COLOR)

# draw simple conveyor lines connecting PAC to Filling_Unit and Packaging_Unit if present
def find_machine(name_prefix):
    for name,x,y,w,h in placements:
        if name.startswith(name_prefix):
            return (name,x,y,w,h)
    return None

filling = find_machine('Filling_Unit')
pack = find_machine('Packaging_Unit')
if filling:
    # connect to PAC center
    name,x,y,w,h = filling
    fx = (x + w/2)*CELL
    fy = (y + h/2)*CELL
    px = (pac_x + pac_w/2)*CELL
    py = (pac_y + pac_h/2)*CELL
    d.line([(px,py),(fx,fy)], fill=CONV_COLOR, width=2)
if pack:
    name,x,y,w,h = pack
    qx = (x + w/2)*CELL
    qy = (y + h/2)*CELL
    px = (pac_x + pac_w/2)*CELL
    py = (pac_y + pac_h/2)*CELL
    d.line([(px,py),(qx,qy)], fill=CONV_COLOR, width=2)

# Legend
legend_items = [ ('PAC_Tower',PAC_COLOR), ('Machine',MACHINE_COLOR), ('Pylon',PYLON_COLOR), ('Conveyor',CONV_COLOR) ]
lx = 5
ly = IMG_SIZE - 60
for label,color in legend_items:
    d.rectangle([lx,ly,lx+12,ly+12], fill=color)
    d.text((lx+18,ly), label, fill=TEXT_COLOR, font=font)
    ly += 16

img.save('blueprint.png')
print('blueprint.png generated')
