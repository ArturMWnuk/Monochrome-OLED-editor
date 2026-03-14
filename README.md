# Monochrome-OLED-editor
Monochrome OLED editor 


![OLED Converter Hero](banner.png)

## 🌐 English Version

### 📝 Description
**OLED Converter** is a powerful, web-based tool designed for developers and enthusiasts working with monochrome OLED displays (like SSD1306, SH1106). It allows you to quickly convert standard images (JPG, PNG, BMP) into various code formats compatible with microcontrollers like Arduino, ESP32, or STM32.

With a built-in pixel editor and real-time preview, you can fine-tune your graphics to look perfect on small screens.

### ✨ Key Features
- **Smart Conversion**: Drag & drop any image and convert it to a monochrome bitmap using an adjustable brightness threshold.
- **Pixel Editor**: Manually touch up your converted image using pencil and eraser tools.
- **Advanced Export Formats**:
    - **C Array (Hex)**: Standard format for Arduino/C++ projects (supports Vertical and Horizontal layouts).
    - **XBM**: Classic X BitMap format.
    - **Raw Bytes**: Hex dump for custom implementations.
- **Customizable Layout**: Choose between Vertical (Page) layout for SSD1306 or standard Horizontal layout.
- **Real-time Preview**: See exactly how your image will look on the OLED screen with zoom functionality.
- **Premium UI**: Modern, responsive design with Dark and Light mode support.

### 🚀 How to Use
1. **Upload**: Drag an image into the "Upload" area or click to select a file.
2. **Configure**:
    - Set the target **Width** and **Height** (e.g., 128x64).
    - Adjust the **Threshold** slider to control which parts of the image become pixels.
    - Use **Invert** if you want to swap black and white.
3. **Edit**: If needed, use the **Pencil** ✏️ or **Eraser** 🧼 to fix individual pixels.
4. **Export**: Select your desired format, copy the code, or save it to a file.

---

## 🇵🇱 Wersja Polska

### 📝 Opis
**OLED Konwerter** to zaawansowane narzędzie webowe stworzone dla programistów i hobbystów pracujących z monochromatycznymi wyświetlaczami OLED (np. SSD1306, SH1106). Pozwala na szybką konwersję standardowych obrazów (JPG, PNG, BMP) na różne formaty kodu kompatybilne z mikrokontrolerami takimi jak Arduino, ESP32 czy STM32.

Dzięki wbudowanemu edytorowi pikseli i podglądowi w czasie rzeczywistym, możesz dopracować swoją grafikę tak, aby wyglądała idealnie na małym ekranie.

### ✨ Główne Funkcje
- **Inteligentna Konwersja**: Przeciągnij dowolny obraz i przekonwertuj go na monitochromatyczną bitmapę, korzystając z regulowanego progu jasności.
- **Edytor Pikseli**: Ręcznie poprawiaj przekonwertowany obraz za pomocą narzędzi ołówka i gumki.
- **Zaawansowane Formaty Eksportu**:
    - **C Array (Hex)**: Standardowy format dla projektów Arduino/C++ (obsługuje układ pionowy i poziomy).
    - **XBM**: Klasyczny format X BitMap.
    - **Raw Bytes**: Zrzut hex dla niestandardowych implementacji.
- **Konfigurowalny Układ**: Wybierz między układem pionowym (Vertical/Page) dla SSD1306 a standardowym układem poziomym.
- **Podgląd na żywo**: Zobacz dokładnie, jak Twój obraz będzie wyglądał na ekranie OLED dzięki funkcji zoomu.
- **Interfejs Premium**: Nowoczesny, responsywny design z obsługą trybu ciemnego i jasnego.

### 🚀 Jak używać
1. **Wczytaj**: Przeciągnij obraz do sekcji "Wczytaj Obraz" lub kliknij, aby wybrać plik.
2. **Skonfiguruj**:
    - Ustaw docelową **szerokość** i **wysokość** (np. 128x64).
    - Dostosuj suwak **Progu Jasności**, aby kontrolować, które części obrazu staną się pikselami.
    - Użyj opcji **Inwersja**, aby zamienić kolory miejscami.
3. **Edytuj**: W razie potrzeby użyj **Ołówka** ✏️ lub **Gumki** 🧼, aby poprawić pojedyncze piksele.
4. **Eksportuj**: Wybierz żądany format, skopiuj kod lub zapisz go do pliku.

---

### 🛠️ Technology Stack | Technologie
- **Frontend**: HTML5, Vanilla CSS (Glassmorphism), JavaScript (ES6+)
- **Graphics**: HTML5 Canvas API
- **Icons**: Emoji & SVG
- **Fonts**: Inter (Google Fonts)

---
