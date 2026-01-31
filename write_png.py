import base64
png_b64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
)
with open('blueprint.png', 'wb') as f:
    f.write(base64.b64decode(png_b64))
print('blueprint.png written')
