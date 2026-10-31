import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SONG_DIR = ROOT / "song"
PLAYLIST_FILE = SONG_DIR / "playlist.json"
PLAYLIST_SCRIPT = SONG_DIR / "playlist.js"


def main():
    if not SONG_DIR.is_dir():
        raise FileNotFoundError(f"Folderul cu melodii nu există: {SONG_DIR}")

    files = sorted(
        (path.name for path in SONG_DIR.iterdir() if path.is_file() and path.suffix.lower() == ".mp3"),
        key=str.casefold,
    )
    PLAYLIST_FILE.write_text(
        json.dumps(files, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    PLAYLIST_SCRIPT.write_text(
        "window.LYRA_SONG_FILES = "
        + json.dumps(files, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(f"Lista a fost generată: {len(files)} melodii.")


if __name__ == "__main__":
    main()
