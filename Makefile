# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ysabik <ysabik@student.42.fr>              +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/07/13 05:08:21 by ysabik            #+#    #+#              #
#    Updated: 2024/07/16 12:06:19 by ysabik           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

EXECUTOR		=	python3
MAIN_FILE		=	main.py
LOG_FILE		=	log.txt


RESET			=	\033[0m
BOLD			=	\033[1m
ITALIC			=	\033[3m
RED				=	\033[31m
GREEN			=	\033[32m
YELLOW			=	\033[33m
MAGENTA			=	\033[35m
DIM				=	\033[2m


# **************************************************************************** #


all: run


run:
	@echo "$(RED)$$> $(MAGENTA)$(EXECUTOR) $(MAIN_FILE)$(RESET)"
	@$(EXECUTOR) $(MAIN_FILE) &


kill:
	@echo "$(RED)$$> $(MAGENTA)kill -9 $$(pgrep $(EXECUTOR))$(RESET)"
	@kill -9 $$(pgrep $(EXECUTOR))


sleep:
	@sleep 1


re: kill sleep run


# **************************************************************************** #


logs:
	@echo "$(RED)$$> $(MAGENTA)watch -n0.3 -c cat $(LOG_FILE) '|' tail '-$$(($$LINES - 2))'$(RESET)"
	@watch -n0.3 -c cat $(LOG_FILE) '|' tail '-$$(($$LINES - 2))'


cat:
	@echo "$(RED)$$> $(MAGENTA)cat $(LOG_FILE)$(RESET)"
	@cat $(LOG_FILE)


# **************************************************************************** #

.PHONY: all run kill re logs cat
