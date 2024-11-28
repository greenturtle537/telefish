
import tkinter as tk
from tkinter import filedialog
from PIL import Image, ImageTk
import base64
import os
import ast  # Import ast for safe parsing

# TODO: Fix the keybind functionality

# git push

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
        
        self.is_drawing = False
        self.start_x = None
        self.start_y = None
        
        self.log_file = "tilemap_log.txt"
        self.clear_log()
        
        self.current_theme = 'dark'  # Default to dark theme
        self.create_widgets()
        self.load_spritesheet()
        self.bind_shortcuts()
        self.bind_navigation()
        self.apply_theme(self.current_theme)  # Apply the initial theme
        
        self.current_tool = 'brush'  # Track the current tool
        self.stroke_coords = []      # Store coordinates for brush strokes
        
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)

    def create_widgets(self):
        self.root.grid_rowconfigure(0, weight=1)
        self.root.grid_columnconfigure(1, weight=1)
        
        self.spritesheet_frame = tk.Frame(self.root)
        self.spritesheet_frame.grid(row=0, column=0, sticky='ns')
        
        self.canvas = tk.Canvas(self.root, highlightthickness=2, highlightbackground='black',
                                width=2000, height=2000, scrollregion=(0, 0, 2000, 2000))
        self.canvas.grid(row=0, column=1, sticky='nsew')
        self.canvas.bind("<Button-1>", self.start_drawing)
        self.canvas.bind("<B1-Motion>", self.draw_tile)
        self.canvas.bind("<ButtonRelease-1>", self.stop_drawing)
        
        self.button_frame = tk.Frame(self.root)
        self.button_frame.grid(row=1, column=0, columnspan=2, sticky='ew')
        
        # Page navigation buttons
        self.prev_page_button = tk.Button(self.button_frame, text='Prev', command=self.prev_page)
        self.prev_page_button.pack(side=tk.LEFT)
        self.add_tooltip(self.prev_page_button, 'Previous Page')
        
        self.next_page_button = tk.Button(self.button_frame, text='Next', command=self.next_page)
        self.next_page_button.pack(side=tk.LEFT)
        self.add_tooltip(self.next_page_button, 'Next Page')
        
        self.save_button = tk.Button(self.button_frame, text='Save', command=self.save_tilemap)
        self.save_button.pack(side=tk.LEFT)
        self.add_tooltip(self.save_button, 'Save (Ctrl+S)')
        
        self.load_button = tk.Button(self.button_frame, text='Load', command=self.load_tilemap)
        self.load_button.pack(side=tk.LEFT)
        self.add_tooltip(self.load_button, 'Load (Ctrl+O)')
        
        self.quit_button = tk.Button(self.button_frame, text='Quit', command=self.root.quit)
        self.quit_button.pack(side=tk.LEFT)
        self.add_tooltip(self.quit_button, 'Quit')
        
        # New buttons
        self.undo_button = tk.Button(self.button_frame, text='Undo', command=self.undo)
        self.undo_button.pack(side=tk.LEFT)
        self.add_tooltip(self.undo_button, 'Undo (Ctrl+Z)')
        
        self.redo_button = tk.Button(self.button_frame, text='Redo', command=self.redo)
        self.redo_button.pack(side=tk.LEFT)
        self.add_tooltip(self.redo_button, 'Redo (Ctrl+Y)')
        
        self.up_button = tk.Button(self.button_frame, text='Up', command=lambda: self.scroll_up(None))
        self.up_button.pack(side=tk.LEFT)
        self.add_tooltip(self.up_button, 'Scroll Up (Up Arrow)')
        
        self.down_button = tk.Button(self.button_frame, text='Down', command=lambda: self.scroll_down(None))
        self.down_button.pack(side=tk.LEFT)
        self.add_tooltip(self.down_button, 'Scroll Down (Down Arrow)')
        
        self.left_button = tk.Button(self.button_frame, text='Left', command=lambda: self.scroll_left(None))
        self.left_button.pack(side=tk.LEFT)
        self.add_tooltip(self.left_button, 'Scroll Left (Left Arrow)')
        
        self.right_button = tk.Button(self.button_frame, text='Right', command=lambda: self.scroll_right(None))
        self.right_button.pack(side=tk.LEFT)
        self.add_tooltip(self.right_button, 'Scroll Right (Right Arrow)')
        
        # Move fill and brush tool buttons next to each other
        self.brush_tool_button = tk.Button(self.button_frame, text='Brush Tool', command=self.activate_brush_tool)
        self.brush_tool_button.pack(side=tk.LEFT)
        self.add_tooltip(self.brush_tool_button, 'Brush Tool (B)')
        
        self.fill_tool_button = tk.Button(self.button_frame, text='Fill Tool', command=self.activate_fill_tool)
        self.fill_tool_button.pack(side=tk.LEFT)
        self.add_tooltip(self.fill_tool_button, 'Fill Tool (F)')
        
        self.tool_label = tk.Label(self.button_frame, text='Current Tool: None')
        self.tool_label.pack(side=tk.LEFT, padx=10)

        # Theme toggle button
        self.theme_toggle_button = tk.Button(self.button_frame, text='Toggle Theme', command=self.toggle_theme)
        self.theme_toggle_button.pack(side=tk.LEFT)
        self.add_tooltip(self.theme_toggle_button, 'Toggle Light/Dark Theme')

    def toggle_theme(self):
        self.current_theme = 'light' if self.current_theme == 'dark' else 'dark'
        self.apply_theme(self.current_theme)

    def apply_theme(self, theme):
        if theme == 'dark':
            bg_color = '#2e2e2e'  # Dark gray background
            fg_color = '#ffffff'  # White foreground/text color
            btn_bg = '#3e3e3e'    # Button background
            btn_fg = '#ffffff'    # Button text color
            canvas_bg = '#2e2e2e' # Dark background for canvas
        else:
            bg_color = '#ffffff'  # White background
            fg_color = '#000000'  # Black foreground/text color
            btn_bg = '#f0f0f0'    # Light gray button background
            btn_fg = '#000000'    # Black button text color
            canvas_bg = '#ffffff' # Light background for canvas

        self.root.configure(bg=bg_color)
        self.spritesheet_frame.configure(bg=bg_color)
        self.canvas.configure(bg=canvas_bg, highlightbackground=btn_fg)
        self.button_frame.configure(bg=bg_color)

        # Update buttons to use theme colors
        button_list = [
            self.prev_page_button, self.next_page_button, self.save_button, self.load_button,
            self.quit_button, self.undo_button, self.redo_button, self.up_button,
            self.down_button, self.left_button, self.right_button, self.fill_tool_button,
            self.brush_tool_button, self.theme_toggle_button
        ]
        for button in button_list:
            button.configure(bg=btn_bg, activebackground=btn_bg, fg=btn_fg, activeforeground=btn_fg)

        # Update labels with theme colors
        self.tool_label.configure(bg=bg_color, fg=fg_color)

        # Update the background of the imported tiles
        self.update_tile_backgrounds(btn_bg, btn_fg)

    def update_tile_backgrounds(self, bg_color, fg_color):
        for widget in self.spritesheet_frame.winfo_children():
            widget.configure(bg=bg_color, fg=fg_color)

    def bind_shortcuts(self):
        self.root.bind('<Control-z>', self.undo)
        self.root.bind('<Control-y>', self.redo)
        self.root.bind('<Control-s>', lambda e: self.save_tilemap())
        self.root.bind('<Control-o>', lambda e: self.load_tilemap())
        self.root.bind('b', lambda e: self.activate_brush_tool())
        self.root.bind('f', lambda e: self.activate_fill_tool())
        
    def bind_navigation(self):
        self.root.bind('<Up>', self.scroll_up)
        self.root.bind('<Down>', self.scroll_down)
        self.root.bind('<Left>', self.scroll_left)
        self.root.bind('<Right>', self.scroll_right)
        self.root.bind('w', self.scroll_up)
        self.root.bind('a', self.scroll_left)
        self.root.bind('s', self.scroll_down)
        self.root.bind('d', self.scroll_right)
        
    def scroll_up(self, event):
        self.canvas.yview_scroll(-1, "units")
        
    def scroll_down(self, event):
        self.canvas.yview_scroll(1, "units")
        
    def scroll_left(self, event):
        self.canvas.xview_scroll(-1, "units")
        
    def scroll_right(self, event):
        self.canvas.xview_scroll(1, "units")
        
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
        base64_code = self.encode_base64(tile_count)  # Use Base64 encoding
        tile_image_resized = tile_image.resize((self.display_tile_size, self.display_tile_size), Image.NEAREST)
        photo_image = ImageTk.PhotoImage(tile_image_resized)
        self.tiles.append({'image': tile_image_resized, 'photo': photo_image, 'base64_code': base64_code})
        tile_count += 1

        for y in range(0, sheet_height, self.tile_size):
            for x in range(0, sheet_width, self.tile_size):
                box = (x, y, x + self.tile_size, y + self.tile_size)
                tile_image = self.spritesheet_image.crop(box)
                if not (tile_image == self.tiles[0]['image']):                
                    base64_code = self.encode_base64(tile_count)  # Use Base64 encoding
                    tile_image_resized = tile_image.resize((self.display_tile_size, self.display_tile_size), Image.NEAREST)
                    photo_image = ImageTk.PhotoImage(tile_image_resized)
                    self.tiles.append({'image': tile_image_resized, 'photo': photo_image, 'base64_code': base64_code})
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

        # Determine the background and foreground colors based on the current theme
        tile_bg_color = '#3e3e3e' if self.current_theme == 'dark' else '#f0f0f0'
        tile_fg_color = '#ffffff' if self.current_theme == 'dark' else '#000000'

        for idx, tile in enumerate(current_tiles):
            row = idx % max_rows
            column = idx // max_rows
            btn = tk.Button(
                self.spritesheet_frame, 
                image=tile['photo'], 
                text=tile['base64_code'], 
                compound='top', 
                command=lambda idx=start_idx+idx: self.select_tile(idx),
                bg=tile_bg_color,  # Set the background color based on the theme
                fg=tile_fg_color   # Set the foreground color based on the theme
            )
            btn.grid(row=row, column=column)
        self.update_page_buttons()
                
    def select_tile(self, idx):
        self.selected_tile = self.tiles[idx]
        self.canvas.focus_set()
        self.tool_label.config(text='Current Tool: Brush')
        
    def start_drawing(self, event):
        if self.selected_tile and self.current_tool == 'brush':
            self.is_drawing = True
            self.stroke_coords = []
            self.place_tile(event)

    def draw_tile(self, event):
        if self.is_drawing and self.current_tool == 'brush':
            self.place_tile(event)

    def stop_drawing(self, event):
        if self.is_drawing and self.current_tool == 'brush':
            self.is_drawing = False
            if self.stroke_coords:
                base64_code = self.selected_tile['base64_code']
                self.action_stack.append(('brush', (self.stroke_coords.copy(), base64_code)))
                self.redo_stack.clear()
                self.log_action("action", f"brush,{self.stroke_coords},{base64_code}", base64_code)
            self.stroke_coords = []

    def place_tile(self, event):
        x = (self.canvas.canvasx(event.x) // self.display_tile_size) * self.display_tile_size
        y = (self.canvas.canvasy(event.y) // self.display_tile_size) * self.display_tile_size
        base64_code = self.selected_tile['base64_code']
        if (x, y) not in self.tilemap_data or self.tilemap_data[(x, y)] != base64_code:
            image_id = self.canvas.create_image(x, y, image=self.selected_tile['photo'], anchor='nw')
            self.image_refs.append(self.selected_tile['photo'])
            self.tilemap_data[(x, y)] = base64_code
            self.stroke_coords.append((x, y))  # Track tiles in the current stroke

    def fill_area(self, start_x, start_y, end_x, end_y):
        if self.selected_tile:
            base64_code = self.selected_tile['base64_code']
            fill_action = []
            for x in range(int(min(start_x, end_x)), int(max(start_x, end_x)) + self.display_tile_size, self.display_tile_size):
                for y in range(int(min(start_y, end_y)), int(max(start_y, end_y)) + self.display_tile_size, self.display_tile_size):
                    self.place_tile_at(x, y, base64_code, log_action=False)
                    fill_action.append((x, y))
            if fill_action:
                self.action_stack.append(('fill', (fill_action, base64_code)))
                self.redo_stack.clear()
                self.log_action("action", f"fill,{fill_action},{base64_code}")

    def clear_log(self):
        with open(self.log_file, 'w') as f:
            f.write("")

    def log_action(self, action_type, coordinates, tile_type):
        with open(self.log_file, "a") as log_file:
            log_file.write(f"action:{action_type},{coordinates},{tile_type}\n")

    def undo(self, event=None):
        if not self.action_stack:
            return
        action = self.action_stack.pop()
        action_type, data = action
        if action_type == 'brush':
            coords_list, _ = data
            for coords in coords_list:
                self.undo_add(coords)
            self.redo_stack.append(action)
            self.log_action("undo", coords_list, "brush")
        elif action_type == 'fill':
            coords_list, base64_code = data
            for coords in coords_list:
                if coords in self.tilemap_data:
                    del self.tilemap_data[coords]
                items = self.canvas.find_overlapping(
                    coords[0], coords[1],
                    coords[0] + self.display_tile_size,
                    coords[1] + self.display_tile_size
                )
                for item in items:
                    self.canvas.delete(item)
            self.redo_stack.append(action)
            self.log_action("undo", coords_list, "fill")
        elif action_type == 'add':
            coords, image_id, base64_code = data
            self.canvas.delete(image_id)
            if coords in self.tilemap_data:
                del self.tilemap_data[coords]
            self.redo_stack.append(action)
            self.log_action("undo", [coords], "add")

    def redo(self, event=None):
        if not self.redo_stack:
            return
        action = self.redo_stack.pop()
        action_type, data = action
        if action_type == 'brush':
            coords_list, base64_code = data
            for coords in coords_list:
                self.redo_add(coords, base64_code)
            self.action_stack.append(action)
            self.log_action("redo", coords_list, "brush")
        elif action_type == 'fill':
            coords_list, base64_code = data
            for coords in coords_list:
                self.redo_add(coords, base64_code)
            self.action_stack.append(action)
            self.log_action("redo", coords_list, "fill")
        elif action_type == 'add':
            coords, _, base64_code = data
            self.place_tile_at(coords[0], coords[1], base64_code, log_action=False)
            self.action_stack.append(action)
            self.log_action("redo", [coords], "add")

    def replay_log(self):
        if not os.path.exists(self.log_file):
            return
        with open(self.log_file, 'r') as f:
            lines = f.readlines()
        for line in lines:
            action, data = line.strip().split(":", 1)
            action_type, *params = data.split(",", 2)
            if action == "action":
                if action_type == "brush":
                    coords_list = ast.literal_eval(params[0])
                    base64_code = params[1]
                    for coords in coords_list:
                        self.place_tile_at(coords[0], coords[1], base64_code, log_action=False)
                elif action_type == "fill":
                    coords_list = ast.literal_eval(params[0])
                    base64_code = params[1]
                    for coords in coords_list:
                        self.place_tile_at(coords[0], coords[1], base64_code, log_action=False)
                elif action_type == "add":
                    pass  # No changes needed
            elif action == "undo":
                pass  # Adjust if necessary
            elif action == "redo":
                pass  # Adjust if necessary

    def undo_add(self, coords):
        items = self.canvas.find_overlapping(
            coords[0], coords[1],
            coords[0] + self.display_tile_size,
            coords[1] + self.display_tile_size
        )
        for item in items:
            self.canvas.delete(item)
        if coords in self.tilemap_data:
            del self.tilemap_data[coords]

    def undo_fill(self, coords_list):
        for coords in coords_list:
            self.undo_add(coords)

    def redo_add(self, coords, base64_code):
        self.place_tile_at(coords[0], coords[1], base64_code, log_action=False)

    def redo_fill(self, coords_list, base64_code):
        for coords in coords_list:
            self.redo_add(coords, base64_code)

    def place_tile_at(self, x, y, base64_code, log_action=True):
        for tile in self.tiles:
            if tile['base64_code'] == base64_code:
                image_id = self.canvas.create_image(x, y, image=tile['photo'], anchor='nw')
                self.image_refs.append(tile['photo'])
                self.tilemap_data[(x, y)] = base64_code
                if log_action:
                    self.action_stack.append(('add', ((x, y), image_id, base64_code)))
                    self.redo_stack.clear()
                    self.log_action("action", f"add,{(x, y)},{base64_code}")
                break

    def save_tilemap(self):
        if not self.tilemap_data:
            return
        file_path = filedialog.asksaveasfilename(
            title='Save Tilemap', defaultextension='.txt', filetypes=[('Text Files', '*.txt')]
        )
        if not file_path:
            return
        grid_width = self.screen_width // self.display_tile_size
        grid_height = self.screen_height // self.display_tile_size
        with open(file_path, 'w') as f:
            for y in range(grid_height):
                tile_codes = []
                for x in range(grid_width):
                    coords = (x * self.display_tile_size, y * self.display_tile_size)
                    base64_code = self.tilemap_data.get(coords, 'AA')
                    tile_codes.append(base64_code)
                f.write(''.join(tile_codes) + '\n')

    def load_tilemap(self):
        file_path = filedialog.askopenfilename(
            title='Load Tilemap', filetypes=[('Text Files', '*.txt')]
        )
        if not file_path:
            return
        self.canvas.delete('all')
        self.tilemap_data = {}
        self.action_stack.clear()
        self.redo_stack.clear()
        with open(file_path, 'r') as f:
            lines = f.readlines()
        grid_width = self.screen_width // self.display_tile_size
        for y, line in enumerate(lines):
            line = line.strip()
            for x in range(0, len(line), 2):
                base64_code = line[x:x+2]
                if base64_code == 'AA':
                    continue
                coords = ((x // 2) * self.display_tile_size, y * self.display_tile_size)
                for tile in self.tiles:
                    if tile['base64_code'] == base64_code:
                        image_id = self.canvas.create_image(
                            coords[0], coords[1], image=tile['photo'], anchor='nw'
                        )
                        self.image_refs.append(tile['photo'])
                        self.tilemap_data[coords] = base64_code
                        self.action_stack.append(('add', coords, image_id))
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
        
    def activate_fill_tool(self):
        self.current_tool = 'fill'
        self.tool_label.config(text='Current Tool: Fill')
        self.canvas.bind("<Button-1>", self.fill_tool)
        self.canvas.unbind("<B1-Motion>")
        self.canvas.unbind("<ButtonRelease-1>")

    def fill_tool(self, event):
        if self.selected_tile:
            x = (self.canvas.canvasx(event.x) // self.display_tile_size) * self.display_tile_size
            y = (self.canvas.canvasy(event.y) // self.display_tile_size) * self.display_tile_size
            target_code = self.tilemap_data.get((x, y), 'AA')
            if target_code != self.selected_tile['base64_code']:
                self.flood_fill(x, y, target_code, self.selected_tile['base64_code'])

    def flood_fill(self, x, y, target_code, replacement_code):
        if target_code == replacement_code:
            return
        fill_action = []
        stack = [(x, y)]
        while stack:
            cx, cy = stack.pop()
            current_code = self.tilemap_data.get((cx, cy), 'AA')
            if current_code == target_code:
                if self.is_in_view(cx, cy):
                    self.place_tile_at(cx, cy, replacement_code, log_action=False)
                    fill_action.append((cx, cy))
                    stack.extend([
                        (cx + self.display_tile_size, cy),
                        (cx - self.display_tile_size, cy),
                        (cx, cy + self.display_tile_size),
                        (cx, cy - self.display_tile_size)
                    ])
        if fill_action:
            self.action_stack.append(('fill', (fill_action, replacement_code)))
            self.redo_stack.clear()
            self.log_action("action", f"fill,{fill_action},{replacement_code}", replacement_code)

    def is_in_view(self, x, y):
        canvas_x1 = self.canvas.canvasx(0)
        canvas_y1 = self.canvas.canvasy(0)
        canvas_x2 = canvas_x1 + self.canvas.winfo_width()
        canvas_y2 = canvas_y1 + self.canvas.winfo_height()
        return canvas_x1 <= x < canvas_x2 and canvas_y1 <= y < canvas_y2

    def place_tile_at(self, x, y, base64_code, log_action=True):
        for tile in self.tiles:
            if tile['base64_code'] == base64_code:
                image_id = self.canvas.create_image(x, y, image=tile['photo'], anchor='nw')
                self.image_refs.append(tile['photo'])
                self.tilemap_data[(x, y)] = base64_code
                if log_action:
                    self.action_stack.append(('add', ((x, y), image_id, base64_code)))
                    self.redo_stack.clear()
                    self.log_action("action", f"add,{(x, y)},{base64_code}")
                break

    def activate_brush_tool(self):
        self.current_tool = 'brush'
        self.tool_label.config(text='Current Tool: Brush')
        self.canvas.bind("<Button-1>", self.start_drawing)
        self.canvas.bind("<B1-Motion>", self.draw_tile)
        self.canvas.bind("<ButtonRelease-1>", self.stop_drawing)

    def add_tooltip(self, widget, text):
        tooltip = tk.Toplevel(widget)
        tooltip.withdraw()
        tooltip.overrideredirect(True)
        tooltip.configure(bg='#444444')  # Darker gray for tooltip background
        tk.Label(
            tooltip, text=text, bg='#444444', fg='#ffffff',
            relief='solid', bd=1, padx=5, pady=2
        ).pack()

        def show_tooltip(event):
            x = event.widget.winfo_rootx() + 20
            y = event.widget.winfo_rooty() - 20  # Move tooltip up and to the right
            tooltip.geometry(f"+{x}+{y}")
            tooltip.deiconify()

        def hide_tooltip(event):
            tooltip.withdraw()

        widget.bind("<Enter>", show_tooltip)
        widget.bind("<Leave>", hide_tooltip)

    def log_action(self, action_type, coordinates, tile_type):
        with open(self.log_file, "a") as log_file:
            log_file.write(f"action:{action_type},{coordinates},{tile_type}\n")

    def undo_action(self):
        if not self.action_stack:
            return
        action = self.action_stack.pop()
        action_type, data = action
        if action_type == 'brush':
            coords_list, _ = data
            for coords in coords_list:
                self.undo_add(coords)
            self.redo_stack.append(action)
            self.log_action("undo", f"brush,{coords_list}")
        elif action_type == 'fill':
            coords_list, base64_code = data
            for coords in coords_list:
                if coords in self.tilemap_data:
                    del self.tilemap_data[coords]
                items = self.canvas.find_overlapping(
                    coords[0], coords[1],
                    coords[0] + self.display_tile_size,
                    coords[1] + self.display_tile_size
                )
                for item in items:
                    self.canvas.delete(item)
            self.redo_stack.append(action)
            self.log_action("undo", f"fill,{coords_list},{base64_code}")
        elif action_type == 'add':
            coords, image_id, base64_code = data
            self.canvas.delete(image_id)
            if coords in self.tilemap_data:
                del self.tilemap_data[coords]
            self.redo_stack.append(action)
            self.log_action("undo", f"add,{coords},{base64_code}")

    def redo_action(self):
        if not self.redo_stack:
            return
        action = self.redo_stack.pop()
        action_type, data = action
        if action_type == 'brush':
            coords_list, base64_code = data
            for coords in coords_list:
                self.redo_add(coords, base64_code)
            self.action_stack.append(action)
            self.log_action("redo", f"brush,{coords_list},{base64_code}")
        elif action_type == 'fill':
            coords_list, base64_code = data
            for coords in coords_list:
                self.redo_add(coords, base64_code)
            self.action_stack.append(action)
            self.log_action("redo", f"fill,{coords_list},{base64_code}")
        elif action_type == 'add':
            coords, _, base64_code = data
            self.place_tile_at(coords[0], coords[1], base64_code, log_action=False)
            self.action_stack.append(action)
            self.log_action("redo", f"add,{coords},{base64_code}")

    def parse_log_entry(self, log_entry):
        parts = log_entry.strip().split(',')
        action_type = parts[0].split(':')[1]
        coordinates = eval(parts[1])
        tile_type = parts[2]
        original_tiles = eval(parts[3])
        return action_type, coordinates, tile_type, original_tiles

    def get_tile_at(self, coord):
        return self.tilemap_data.get(coord, 'AA')

    def set_tile_at(self, coord, tile):
        self.tilemap_data[coord] = tile
        for tile in self.tiles:
            if tile['base64_code'] == tile:
                image_id = self.canvas.create_image(coord[0], coord[1], image=tile['photo'], anchor='nw')
                self.image_refs.append(tile['photo'])
                break

    def on_closing(self):
        self.clear_log()
        self.root.destroy()

if __name__ == '__main__':
    root = tk.Tk()
    app = TilemapCreator(root)
    app.replay_log()
    root.mainloop()