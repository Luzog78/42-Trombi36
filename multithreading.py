from threading import Thread


def async_func(func, after=None):
	def wrapper(*args, **kwargs):
		def f(*args, **kwargs):
			result = func(*args, **kwargs)
			if after:
				return after(result)
			return result
		thread = Thread(target=f, args=args, kwargs=kwargs)
		thread.start()
	return wrapper
