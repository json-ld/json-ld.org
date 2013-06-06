# JSON-LD Data Icons

LOGO_NAME=json-ld-logo
LOGO_SRC=$(LOGO_NAME).svg
LOGO_PNGS=\
	$(LOGO_NAME).png \
	$(LOGO_NAME)-64.png

BUTTON_NAME=json-ld-button
BUTTON_SRC=$(BUTTON_NAME).svg
BUTTON_PNGS=\
	$(BUTTON_NAME).png \
	$(BUTTON_NAME)-88.png

DATA_NAME=json-ld-data
DATA_SRC=$(DATA_NAME).svg
DATA_PNGS=\
	$(DATA_NAME).png \
	$(DATA_NAME)-64.png \
	$(DATA_NAME)-48.png \
	$(DATA_NAME)-32.png \
	$(DATA_NAME)-24.png \
	$(DATA_NAME)-16.png

# Maximum width of "high resolution" PNGs
HD_WIDTH=1920

#	convert -background none -resize 256 $< $(DATA_NAME)-256.gif

all: $(LOGO_PNGS) $(BUTTON_PNGS) $(DATA_PNGS)

clean:
	$(RM) $(LOGO_PNGS) $(BUTTON_PNGS) $(DATA_PNGS)

$(LOGO_PNGS): $(LOGO_SRC)
	inkscape --export-width=64 --export-png=$(LOGO_NAME)-64.png $<
	inkscape --export-width=$(HD_WIDTH) --export-png=$(LOGO_NAME).png $<

$(BUTTON_PNGS): $(BUTTON_SRC)
	inkscape --export-width=88 --export-png=$(BUTTON_NAME)-88.png $<
	inkscape --export-width=$(HD_WIDTH) --export-png=$(BUTTON_NAME).png $<

$(DATA_PNGS): $(DATA_SRC)
	inkscape --export-width=64 --export-png=$(DATA_NAME)-64.png $<
	inkscape --export-width=48 --export-png=$(DATA_NAME)-48.png $<
	inkscape --export-width=32 --export-png=$(DATA_NAME)-32.png $<
	inkscape --export-width=24 --export-png=$(DATA_NAME)-24.png $<
	inkscape --export-width=16 --export-png=$(DATA_NAME)-16.png $<
	inkscape --export-width=$(HD_WIDTH) --export-png=$(DATA_NAME).png $<

