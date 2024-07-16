C_BLACK		= '\033[30m'
C_RED		= '\033[31m'
C_GREEN		= '\033[32m'
C_YELLOW	= '\033[33m'
C_BLUE		= '\033[34m'
C_PURPLE	= '\033[35m'
C_CYAN		= '\033[36m'
C_WHITE		= '\033[37m'

C_H_BLACK	= '\033[90m'
C_H_RED		= '\033[91m'
C_H_GREEN	= '\033[92m'
C_H_YELLOW	= '\033[93m'
C_H_BLUE	= '\033[94m'
C_H_PURPLE	= '\033[95m'
C_H_CYAN	= '\033[96m'
C_H_WHITE	= '\033[97m'

C_BOLD		= '\033[1m'
C_DIM		= '\033[2m'
C_ITALIC	= '\033[3m'
C_UNDERLINE	= '\033[4m'
C_BLINK		= '\033[5m'
C_REVERSE	= '\033[7m'
C_HIDDEN	= '\033[8m'

C_RESET		= '\033[0m'

C_CLEAR		= '\033[0K'
C_CLEARLINE	= '\033[2K'
C_CLEARSCR	= '\033[2J'


M_BLACK			= C_RESET + C_BLACK
M_DARK_BLUE		= C_RESET + C_BLUE
M_DARK_GREEN	= C_RESET + C_GREEN
M_DARK_CYAN		= C_RESET + C_CYAN
M_DARK_RED		= C_RESET + C_RED
M_DARK_PURPLE	= C_RESET + C_PURPLE
M_DARK_YELLOW	= C_RESET + C_YELLOW
M_GRAY			= C_RESET + C_WHITE + C_DIM
M_DARK_GRAY		= C_RESET + C_H_BLACK
M_BLUE			= C_RESET + C_H_BLUE
M_GREEN			= C_RESET + C_H_GREEN
M_CYAN			= C_RESET + C_H_CYAN
M_RED			= C_RESET + C_H_RED
M_PURPLE		= C_RESET + C_H_PURPLE
M_YELLOW		= C_RESET + C_H_YELLOW
M_WHITE			= C_RESET + C_WHITE

M_BOLD			= C_BOLD
M_ITALIC		= C_ITALIC
M_UNDERLINE		= C_UNDERLINE
M_BLINK			= C_BLINK
M_RESET			= C_RESET

CHAR = '§'

CODE = {
	'0': M_BLACK,
	'1': M_DARK_BLUE,
	'2': M_DARK_GREEN,
	'3': M_DARK_CYAN,
	'4': M_DARK_RED,
	'5': M_DARK_PURPLE,
	'6': M_DARK_YELLOW,
	'7': M_GRAY,
	'8': M_DARK_GRAY,
	'9': M_BLUE,
	'a': M_GREEN,
	'b': M_CYAN,
	'c': M_RED,
	'd': M_PURPLE,
	'e': M_YELLOW,
	'f': M_WHITE,

	'l': M_BOLD,
	'o': M_ITALIC,
	'u': M_UNDERLINE,
	'k': M_BLINK,
	'r': M_RESET,
}

STYLES = [ 'l', 'o', 'u', 'k' ]


def format(*args, end: str = M_RESET, char: str | None = None, code: dict[str, str] | None = None, styles: list[str] | None = None):
	if char is None:
		char = CHAR
	if code is None:
		code = CODE
	if styles is None:
		styles = STYLES

	string = ''
	color = ''
	for arg in args:
		arg = f'{arg}'
		l = len(arg)
		i = 0
		while i < l:
			if arg[i] == char:
				i += 1
				if i >= l:
					break
				modif = code.get(arg[i])
				if modif is not None:
					if modif in styles:
						string += color + modif
					else:
						color = modif
						string += color
				elif arg[i] == char:
					string += char
			else:
				string += arg[i]
			i += 1
		string += ' '
	if len(args) > 0:
		string = string[:-1]
	if end is not None:
		string += f'{end}'
	return string


from datetime import datetime
from pytz import timezone


TIMEZONE = timezone("Europe/Paris")

def log(*args, end: str = '\n', filename: str = 'log.txt'):
	dt = datetime.now().astimezone(TIMEZONE).strftime('%Y-%m-%d_%H:%M:%S')
	with open(filename, 'a') as f:
		f.write(f'[{dt}]: {format(*args, end=end)}')


_print = print

def print(*args, end: str = M_RESET + '\n', char: str | None = None, code: dict[str, str] | None = None, styles: list[str] | None = None, logging: bool | str = True):
	if logging:
		if isinstance(logging, str):
			log(format(*args, end=end, char=char, code=code, styles=styles), end='', filename=logging)
		else:
			log(format(*args, end=end, char=char, code=code, styles=styles), end='')
	else:
		_print(format(*args, end=end, char=char, code=code, styles=styles), end='')
