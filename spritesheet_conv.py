from PIL import Image
import struct

# Define ANSI color codes and corresponding RGB values
true_ansi_colors = [
    {'code_fg': '30', 'code_bg': '40', 'r': 0, 'g': 0, 'b': 0},        # Black
    {'code_fg': '31', 'code_bg': '41', 'r': 128, 'g': 0, 'b': 0},      # Red
    {'code_fg': '32', 'code_bg': '42', 'r': 0, 'g': 128, 'b': 0},      # Green
    {'code_fg': '33', 'code_bg': '43', 'r': 128, 'g': 128, 'b': 0},    # Yellow
    {'code_fg': '34', 'code_bg': '44', 'r': 0, 'g': 0, 'b': 128},      # Blue
    {'code_fg': '35', 'code_bg': '45', 'r': 128, 'g': 0, 'b': 128},    # Magenta
    {'code_fg': '36', 'code_bg': '46', 'r': 0, 'g': 128, 'b': 128},    # Cyan
    {'code_fg': '37', 'code_bg': '47', 'r': 192, 'g': 192, 'b': 192},  # White
    {'code_fg': '90', 'code_bg': '100', 'r': 128, 'g': 128, 'b': 128}, # Bright Black
    {'code_fg': '91', 'code_bg': '101', 'r': 255, 'g': 0, 'b': 0},     # Bright Red
    {'code_fg': '92', 'code_bg': '102', 'r': 0, 'g': 255, 'b': 0},     # Bright Green
    {'code_fg': '93', 'code_bg': '103', 'r': 255, 'g': 255, 'b': 0},   # Bright Yellow
    {'code_fg': '94', 'code_bg': '104', 'r': 0, 'g': 0, 'b': 255},     # Bright Blue
    {'code_fg': '95', 'code_bg': '105', 'r': 255, 'g': 0, 'b': 255},   # Bright Magenta
    {'code_fg': '96', 'code_bg': '106', 'r': 0, 'g': 255, 'b': 255},   # Bright Cyan
    {'code_fg': '97', 'code_bg': '107', 'r': 255, 'g': 255, 'b': 255}, # Bright White
]

ansi_colors = [
    {'code_fg': '30', 'code_bg': '40', 'r': 11, 'g': 7, 'b': 12},      # Black
    {'code_fg': '30', 'code_bg': '40', 'r': 6, 'g': 62, 'b': 32},      # Black
    {'code_fg': '30', 'code_bg': '40', 'r': 38, 'g': 92, 'b': 31},    # Black

    {'code_fg': '31', 'code_bg': '41', 'r': 205, 'g': 0, 'b': 41},     # Red
    {'code_fg': '31', 'code_bg': '41', 'r': 247, 'g': 54, 'b': 0},     # Red
    {'code_fg': '32', 'code_bg': '42', 'r': 87, 'g': 177, 'b': 25},    # Green
    {'code_fg': '33', 'code_bg': '43', 'r': 101, 'g': 39, 'b': 25},   # Yellow

    {'code_fg': '34', 'code_bg': '44', 'r': 0, 'g': 0, 'b': 128},      # Blue
    {'code_fg': '35', 'code_bg': '45', 'r': 128, 'g': 0, 'b': 128},    # Magenta
    {'code_fg': '36', 'code_bg': '46', 'r': 54, 'g': 77, 'b': 247},    # Cyan
    {'code_fg': '37', 'code_bg': '47', 'r': 255, 'g': 255, 'b': 139},  # White
    {'code_fg': '37', 'code_bg': '47', 'r': 247, 'g': 247, 'b': 247},  # White
    {'code_fg': '1;30', 'code_bg': '1;40', 'r': 177, 'g': 134, 'b': 194}, # Bright Black

    {'code_fg': '1;31', 'code_bg': '1;41', 'r': 255, 'g': 0, 'b': 128},     # Bright Red
    {'code_fg': '1;32', 'code_bg': '1;42', 'r': 87, 'g': 177, 'b': 25},   # Bright Green
    {'code_fg': '1;33', 'code_bg': '1;43', 'r': 255, 'g': 255, 'b': 139}, # Bright Yellow
    {'code_fg': '1;33', 'code_bg': '1;43', 'r': 205, 'g': 115, 'b': 32}, # Bright Yellow

    {'code_fg': '1;34', 'code_bg': '1;44', 'r': 0, 'g': 0, 'b': 255},     # Bright Blue
    {'code_fg': '1;35', 'code_bg': '1;45', 'r': 255, 'g': 0, 'b': 255},   # Bright Magenta
    {'code_fg': '1;36', 'code_bg': '1;46', 'r': 0, 'g': 255, 'b': 255},   # Bright Cyan
    {'code_fg': '1;37', 'code_bg': '1;47', 'r': 255, 'g': 255, 'b': 255}, # Bright White
]

# Open the image
image = Image.open('assets/4x4/sprite sheet.png').convert('RGB')

# Get image dimensions
width, height = image.size

ansi_lines = []

# Function to find the nearest ANSI color
def nearest_ansi_color(r, g, b):
    min_distance = None
    nearest_color = None
    for color in ansi_colors:
        dr = r - color['r']
        dg = g - color['g']
        db = b - color['b']
        distance = dr * dr + dg * dg + db * db
        if min_distance is None or distance < min_distance:
            min_distance = distance
            nearest_color = color
    return nearest_color, min_distance

# Function to check if a color is bright
def is_bright(color):
    return '1;' in color['code_fg']

# Traverse the image in blocks of 1x2 pixels
for y in range(0, height, 2):
    line = ''
    for x in range(width):
        # Get upper pixel
        pixel_upper = image.getpixel((x, y))

        # Get lower pixel, handle edge case
        if y + 1 < height:
            pixel_lower = image.getpixel((x, y + 1))
        else:
            pixel_lower = (0, 0, 0)  # Default to black if at the edge

        # Find nearest ANSI colors and distances
        color_upper, dist_upper = nearest_ansi_color(*pixel_upper)
        color_lower, dist_lower = nearest_ansi_color(*pixel_lower)

        # Check for bright colors
        upper_bright = is_bright(color_upper)
        lower_bright = is_bright(color_lower)

        if upper_bright and lower_bright:
            if color_upper['code_fg'] == color_lower['code_fg']:
                # Use full block
                ansi_sequence = f'\x1b[{color_upper["code_fg"]};49m█\x1b[0m'
                line += ansi_sequence
                continue
            else:
                print(f"Error at position x={x}, y={y}: Cannot use two different bright colors in the same block.")
                #exit(1)
        elif upper_bright:
            # Option1: '▀' with bright fg and bg not bright
            char = '▀'
            fg_code = color_upper['code_fg']
            bg_code = color_lower['code_bg']
        elif lower_bright:
            # Option2: '▄' with bright fg and bg not bright
            char = '▄'
            fg_code = color_lower['code_fg']
            bg_code = color_upper['code_bg']
        else:
            # Both colors are not bright
            # Option3: If colors are the same, use '█'
            if color_upper['code_fg'] == color_lower['code_fg']:
                char = '█'
                fg_code = color_upper['code_fg']
                bg_code = '49'  # Default background
            else:
                # Use '▀' with upper fg and lower bg
                char = '▀'
                fg_code = color_upper['code_fg']
                bg_code = color_lower['code_bg']

        # Build ANSI escape sequence
        ansi_sequence = f'\x1b[{fg_code};{bg_code}m{char}\x1b[0m'

        line += ansi_sequence
    print(line)
    ansi_lines.append(line + '\r\n')  # Use IBM/Windows line separators

with open('tilemap.ans', 'w', encoding='cp437', newline='\r\n') as ansi_file:
    ansi_file.writelines(ansi_lines)

def create_sauce(title="Telefish", author="Anonymous", group="", copyright="",
                data_type=1, file_size=0, t_info=(0,0,0,0), comments=[]):
    sauce = b'SAUCE'                     # Signature
    sauce += b'00'                        # Version
    sauce += title.ljust(35).encode('ascii', 'ignore')[:35]
    sauce += author.ljust(20).encode('ascii', 'ignore')[:20]
    sauce += group.ljust(20).encode('ascii', 'ignore')[:20]
    sauce += copyright.ljust(13).encode('ascii', 'ignore')[:13]
    sauce += struct.pack('<I', data_type)
    sauce += struct.pack('<I', file_size)
    sauce += struct.pack('<HHHH', *t_info)
    comment_str = ''.join(comments)
    comment_bytes = comment_str.encode('ascii', 'ignore')[:64]
    sauce += comment_bytes.ljust(64, b'\x00')
    sauce += b'\x00' * (128 - len(sauce))  # Padding to 128 bytes
    return sauce

# Example SAUCE metadata
sauce_record = create_sauce(
    title="Telefish",
    author="Anonymous",
    data_type=1,
    file_size=0,
    t_info=(80, 25, 0, 0),
    comments=["Freakbob"]
)

# Append SAUCE to ANSI file
with open('tilemap.ans', 'ab') as ansi_file:
    ansi_file.write(sauce_record)
