import tkinter as tk
from tkinter import filedialog
from PIL import Image, ImageTk
import binascii

class TilemapCreator:
    def __init__(self, root):
        self.root = root
        self.root.title("Tilemap Creator")
        
        self.tile_size = 4
        self.tiles = []
        self.selected_tile = None
        
        self.create_widgets()
        self.load_spritesheet()
        
    def create_widgets(self):
        self.spritesheet_frame = tk.Frame(self.root)
        self.spritesheet_frame.pack(side=tk.LEFT, fill=tk.Y)
        
        self.canvas = tk.Canvas(self.root, width=256, height=256, bg='white')
        self.canvas.pack(side=tk.LEFT)
        self.canvas.bind("<Button-1>", self.place_tile)
        
        self.button_frame = tk.Frame(self.root)
        self.button_frame.pack(side=tk.BOTTOM, fill=tk.X)
        
        self.save_button = tk.Button(self.button_frame, text='Save', command=self.save_tilemap)
        self.save_button.pack(side=tk.LEFT)
        
        self.load_button = tk.Button(self.button_frame, text='Load', command=self.load_tilemap)
        self.load_button.pack(side=tk.LEFT)
        
    def load_spritesheet(self):
        file_path = filedialog.askopenfilename(title='Open Spritesheet', filetypes=[('PNG Images', '*.png')])
        if not file_path:
            return
        self.spritesheet_image = Image.open(file_path)
        self.slice_tiles()
        self.display_tiles()
        
    def slice_tiles(self):
        self.tiles = []
        sheet_width, sheet_height = self.spritesheet_image.size
        for y in range(0, sheet_height, self.tile_size):
            for x in range(0, sheet_width, self.tile_size):
                box = (x, y, x + self.tile_size, y + self.tile_size)
                tile_image = self.spritesheet_image.crop(box)
                tile_data = tile_image.tobytes()
                tile_hex = binascii.hexlify(tile_data).decode('utf-8')
                photo_image = ImageTk.PhotoImage(tile_image)
                self.tiles.append({'image': tile_image, 'photo': photo_image, 'hex': tile_hex})
                
    def display_tiles(self):
        for widget in self.spritesheet_frame.winfo_children():
            widget.destroy()
        for idx, tile in enumerate(self.tiles):
            btn = tk.Button(self.spritesheet_frame, image=tile['photo'], command=lambda idx=idx: self.select_tile(idx))
            btn.grid(row=idx//2, column=idx%2)
            
    def select_tile(self, idx):
        self.selected_tile = self.tiles[idx]
        
    def place_tile(self, event):
        if self.selected_tile:
            x = (event.x // self.tile_size) * self.tile_size
            y = (event.y // self.tile_size) * self.tile_size
            self.canvas.create_image(x, y, image=self.selected_tile['photo'], anchor='nw')
            if not hasattr(self, 'tilemap_data'):
                self.tilemap_data = {}
            self.tilemap_data[(x, y)] = self.selected_tile['hex']
        
    def save_tilemap(self):
        if not hasattr(self, 'tilemap_data'):
            return
        file_path = filedialog.asksaveasfilename(title='Save Tilemap', defaultextension='.txt', filetypes=[('Text Files', '*.txt')])
        if not file_path:
            return
        with open(file_path, 'w') as f:
            for (x, y), hex_code in self.tilemap_data.items():
                f.write(f'{x},{y}:{hex_code}\n')
                
    def load_tilemap(self):
        file_path = filedialog.askopenfilename(title='Load Tilemap', filetypes=[('Text Files', '*.txt')])
        if not file_path:
            return
        self.canvas.delete('all')
        self.tilemap_data = {}
        with open(file_path, 'r') as f:
            for line in f:
                pos, hex_code = line.strip().split(':')
                x, y = map(int, pos.split(','))
                for tile in self.tiles:
                    if tile['hex'] == hex_code:
                        self.canvas.create_image(x, y, image=tile['photo'], anchor='nw')
                        self.tilemap_data[(x, y)] = hex_code
                        break
        
if __name__ == '__main__':
    root = tk.Tk()
    app = TilemapCreator(root)
    root.mainloop()