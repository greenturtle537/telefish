import tkinter as tk
from tkinter import filedialog
from PIL import Image, ImageTk
import base64

# TODO: Fix the keybind functionality

class TilemapCreator:
    BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

    def __init__(self, root):
        self.root = root
        self.root.title("Tilemap Creator")
        self.root.attributes("-fullscreen", True)
        
        self.screen_width = self.root.winfo_screenwidth()
        self.screen_height = self.root.winfo_screenheight()
        
        self.tiles = []
        self.selected_tile = None
        self.image_refs = []
        self.tilemap_data = {}
        self.action_stack = []
        self.redo_stack = []
        
        # Pagination variables
        self.tiles_per_page = 128  # 16 rows * 8 columns
        self.current_page = 1
        self.total_pages = 1
        
        self.create_widgets()
        self.load_spritesheet()
        self.bind_shortcuts()
        self.bind_navigation()
        
    def create_widgets(self):
        self.root.grid_rowconfigure(0, weight=1)
        self.root.grid_columnconfigure(1, weight=1)
        
        self.spritesheet_frame = tk.Frame(self.root)
        self.spritesheet_frame.grid(row=0, column=0, sticky='ns')
        
        self.canvas = tk.Canvas(self.root, bg='white', highlightthickness=2, highlightbackground='black',
                                width=2000, height=2000, scrollregion=(0, 0, 2000, 2000))
        self.canvas.grid(row=0, column=1, sticky='nsew')
        self.canvas.bind("<Button-1>", self.place_tile)
        
        self.button_frame = tk.Frame(self.root)
        self.button_frame.grid(row=1, column=0, columnspan=2, sticky='ew')
        
        # Page navigation buttons
        self.prev_page_button = tk.Button(self.button_frame, text='Prev', command=self.prev_page)
        self.prev_page_button.pack(side=tk.LEFT)
        
        self.next_page_button = tk.Button(self.button_frame, text='Next', command=self.next_page)
        self.next_page_button.pack(side=tk.LEFT)
        
        self.save_button = tk.Button(self.button_frame, text='Save', command=self.save_tilemap)
        self.save_button.pack(side=tk.LEFT)
        
        self.load_button = tk.Button(self.button_frame, text='Load', command=self.load_tilemap)
        self.load_button.pack(side=tk.LEFT)
        
        self.quit_button = tk.Button(self.button_frame, text='Quit', command=self.root.quit)
        self.quit_button.pack(side=tk.LEFT)
        
        # New buttons
        self.undo_button = tk.Button(self.button_frame, text='Undo', command=self.undo)
        self.undo_button.pack(side=tk.LEFT)
        
        self.redo_button = tk.Button(self.button_frame, text='Redo', command=self.redo)
        self.redo_button.pack(side=tk.LEFT)
        
        self.up_button = tk.Button(self.button_frame, text='Up', command=lambda: self.scroll_up(None))
        self.up_button.pack(side=tk.LEFT)
        
        self.down_button = tk.Button(self.button_frame, text='Down', command=lambda: self.scroll_down(None))
        self.down_button.pack(side=tk.LEFT)
        
        self.left_button = tk.Button(self.button_frame, text='Left', command=lambda: self.scroll_left(None))
        self.left_button.pack(side=tk.LEFT)
        
        self.right_button = tk.Button(self.button_frame, text='Right', command=lambda: self.scroll_right(None))
        self.right_button.pack(side=tk.LEFT)
        
        # Debug label
        self.debug_label = tk.Label(self.button_frame, text='Last key: None')
        self.debug_label.pack(side=tk.LEFT, padx=10)
        
    def bind_shortcuts(self):
        self.root.bind('<Control-z>', self.undo)
        self.root.bind('<Control-Z>', self.undo)
        self.root.bind('<Control-Shift-Z>', self.redo)
        self.root.bind('<Control-Shift-z>', self.redo)
        
    def bind_navigation(self):
        self.root.bind('w', self.scroll_up)
        self.root.bind('a', self.scroll_left)
        self.root.bind('s', self.scroll_down)
        self.root.bind('d', self.scroll_right)
        
    def update_debug(self, key):
        self.debug_label.config(text=f'Last key: {key}')
        
    def scroll_up(self, event):
        self.canvas.yview_scroll(-1, "units")
        self.update_debug('w')
        
    def scroll_down(self, event):
        self.canvas.yview_scroll(1, "units")
        self.update_debug('s')
        
    def scroll_left(self, event):
        self.canvas.xview_scroll(-1, "units")
        self.update_debug('a')
        
    def scroll_right(self, event):
        self.canvas.xview_scroll(1, "units")
        self.update_debug('d')
        
    def load_spritesheet(self):
        file_path = filedialog.askopenfilename(title='Open Spritesheet', filetypes=[('PNG Images', '*.png')])
        if not file_path:
            self.root.quit()
            return
        self.spritesheet_image = Image.open(file_path)
        
        self.tile_size = 4
        sheet_width, sheet_height = self.spritesheet_image.size
        self.display_tile_size = max(1, self.screen_height // (sheet_height // self.tile_size))
        
        self.slice_tiles()
        self.total_pages = max(1, (len(self.tiles) + self.tiles_per_page - 1) // self.tiles_per_page)
        self.display_tiles()
        
        self.root.update()  # Update to get accurate widget sizes

    def encode_base64(self, number):
        if number == 0:
            return self.BASE64_ALPHABET[0] + 'A'
        encoded = ""
        while number > 0:
            encoded = self.BASE64_ALPHABET[number % 64] + encoded
            number = number // 64
        if len(encoded) == 1:
            encoded = 'A' + encoded
        return encoded

    def slice_tiles(self):
        self.tiles = []
        sheet_width, sheet_height = self.spritesheet_image.size

        tile_count = 0
        y = sheet_height - self.tile_size
        x = sheet_width - self.tile_size
        box = (x, y, x + self.tile_size, y + self.tile_size)
        tile_image = self.spritesheet_image.crop(box)
        tile_code = self.encode_base64(tile_count)  # Use Base64 encoding
        tile_image_resized = tile_image.resize((self.display_tile_size, self.display_tile_size), Image.NEAREST)
        photo_image = ImageTk.PhotoImage(tile_image_resized)
        self.tiles.append({'image': tile_image_resized, 'photo': photo_image, 'hex': tile_code})
        tile_count += 1

        for y in range(0, sheet_height, self.tile_size):
            for x in range(0, sheet_width, self.tile_size):
                box = (x, y, x + self.tile_size, y + self.tile_size)
                tile_image = self.spritesheet_image.crop(box)
                if not (tile_image == self.tiles[0]['image']):                
                    tile_code = self.encode_base64(tile_count)  # Use Base64 encoding
                    tile_image_resized = tile_image.resize((self.display_tile_size, self.display_tile_size), Image.NEAREST)
                    photo_image = ImageTk.PhotoImage(tile_image_resized)
                    self.tiles.append({'image': tile_image_resized, 'photo': photo_image, 'hex': tile_code})
                    tile_count += 1
                
    def display_tiles(self):
        for widget in self.spritesheet_frame.winfo_children():
            widget.destroy()
        self.root.update()  # Ensure accurate widget sizes
        start_idx = (self.current_page - 1) * self.tiles_per_page
        end_idx = start_idx + self.tiles_per_page
        current_tiles = self.tiles[start_idx:end_idx]
        max_rows = 16
        num_tiles = len(current_tiles)
        num_columns = 8  # Fixed to 8 columns
        for idx, tile in enumerate(current_tiles):
            row = idx % max_rows
            column = idx // max_rows
            btn = tk.Button(
                self.spritesheet_frame, 
                image=tile['photo'], 
                text=tile['hex'], 
                compound='top', 
                command=lambda idx=start_idx+idx: self.select_tile(idx)
            )
            btn.grid(row=row, column=column)
        self.update_page_buttons()
                
    def select_tile(self, idx):
        self.selected_tile = self.tiles[idx]
        self.canvas.focus_set()
        
    def place_tile(self, event):
        if self.selected_tile:
            x = (self.canvas.canvasx(event.x) // self.display_tile_size) * self.display_tile_size
            y = (self.canvas.canvasy(event.y) // self.display_tile_size) * self.display_tile_size
            image_id = self.canvas.create_image(x, y, image=self.selected_tile['photo'], anchor='nw')
            self.image_refs.append(self.selected_tile['photo'])
            if self.selected_tile['hex'] != 'AA':
                self.tilemap_data[(x, y)] = self.selected_tile['hex']
                self.action_stack.append(('add', (x, y), image_id))
                self.redo_stack.clear()
            
    def undo(self, event=None):
        if not self.action_stack:
            return
        action = self.action_stack.pop()
        action_type, coords, image_id = action
        if action_type == 'add':
            self.canvas.delete(image_id)
            if coords in self.tilemap_data:
                del self.tilemap_data[coords]
            self.redo_stack.append(action)
            self.update_debug('undo')
        
    def redo(self, event=None):
        if not self.redo_stack:
            return
        action = self.redo_stack.pop()
        action_type, coords, _ = action
        if action_type == 'add':
            hex_code = self.tilemap_data.get(coords, None)
            if hex_code:
                for tile in self.tiles:
                    if tile['hex'] == hex_code:
                        x, y = coords
                        image_id = self.canvas.create_image(x, y, image=tile['photo'], anchor='nw')
                        self.image_refs.append(tile['photo'])
                        self.action_stack.append(('add', coords, image_id))
                        self.update_debug('redo')
                        break
        
    def save_tilemap(self):
        if not self.tilemap_data:
            return
        file_path = filedialog.asksaveasfilename(title='Save Tilemap', defaultextension='.txt', filetypes=[('Text Files', '*.txt')])
        if not file_path:
            return
        # Determine grid size
        grid_width = self.screen_width // self.display_tile_size
        grid_height = self.screen_height // self.display_tile_size
        tile_codes = []
        for y in range(grid_height):
            for x in range(grid_width):
                coords = (x * self.display_tile_size, y * self.display_tile_size)
                hex_code = self.tilemap_data.get(coords, 'AA')
                tile_codes.append(hex_code)
        # Append base64 codes
        data = ''.join(tile_codes)
        with open(file_path, 'w') as f:
            f.write(data)
                
    def load_tilemap(self):
        file_path = filedialog.askopenfilename(title='Load Tilemap', filetypes=[('Text Files', '*.txt')])
        if not file_path:
            return
        self.canvas.delete('all')
        self.tilemap_data = {}
        self.action_stack.clear()
        self.redo_stack.clear()
        with open(file_path, 'r') as f:
            data = f.read().strip()
        grid_width = self.screen_width // self.display_tile_size
        grid_height = self.screen_height // self.display_tile_size
        for index in range(grid_width * grid_height):
            hex_code = data[index*2:(index+1)*2]
            if hex_code == 'AA':
                continue
            x = (index % grid_width) * self.display_tile_size
            y = (index // grid_width) * self.display_tile_size
            for tile in self.tiles:
                if tile['hex'] == hex_code and hex_code != 'AA':
                    image_id = self.canvas.create_image(x, y, image=tile['photo'], anchor='nw')
                    self.image_refs.append(tile['photo'])
                    self.tilemap_data[(x, y)] = hex_code
                    self.action_stack.append(('add', (x, y), image_id))
                    break
                
    def prev_page(self):
        if self.current_page > 1:
            self.current_page -= 1
            self.display_tiles()
            
    def next_page(self):
        if self.current_page < self.total_pages:
            self.current_page += 1
            self.display_tiles()
            
    def update_page_buttons(self):
        # Update button labels based on current page
        self.prev_page_button.config(text=str(self.current_page - 1) if self.current_page > 1 else "")
        self.next_page_button.config(text=str(self.current_page + 1) if self.current_page < self.total_pages else "")
        
if __name__ == '__main__':
    root = tk.Tk()
    app = TilemapCreator(root)
    root.mainloop()