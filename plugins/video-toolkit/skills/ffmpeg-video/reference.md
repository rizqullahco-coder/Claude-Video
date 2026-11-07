# ffmpeg recipes

All examples write to a new file. Replace `in.mp4` / `out.mp4` with real, quoted paths.

## Resize and crop

```bash
ffmpeg -i in.mp4 -vf "scale=1280:-2" -c:a copy out.mp4                    # 720p-wide, keep aspect
ffmpeg -i in.mp4 -vf "scale=-2:1080" -c:a copy out.mp4                    # 1080 tall
ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih" -c:a copy out_vertical.mp4         # centre-crop to 9:16
ffmpeg -i in.mp4 -vf "cropdetect" -f null - 2>&1 | tail -5                # find black bars
ffmpeg -i in.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" out.mp4  # letterbox to 9:16
```

## Speed, rotation, frame rate

```bash
ffmpeg -i in.mp4 -vf "setpts=0.5*PTS" -af "atempo=2.0" out_2x.mp4          # 2x speed
ffmpeg -i in.mp4 -vf "setpts=2.0*PTS" -af "atempo=0.5" out_half.mp4        # 0.5x speed
ffmpeg -i in.mp4 -vf "transpose=1" -c:a copy out.mp4                       # rotate 90° clockwise
ffmpeg -i in.mp4 -vf "hflip" -c:a copy out.mp4                             # mirror
ffmpeg -i in.mp4 -r 30 out.mp4                                             # change to 30 fps
```

`atempo` accepts 0.5–100; chain it (`atempo=2.0,atempo=2.0`) for larger changes.

## Joining clips

Same codecs and resolution — lossless:

```bash
printf "file '%s'\n" clip1.mp4 clip2.mp4 clip3.mp4 > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy joined.mp4
```

Different sources — re-encode with the concat filter:

```bash
ffmpeg -i a.mp4 -i b.mp4 -filter_complex "[0:v]scale=1280:720,setsar=1[v0];[1:v]scale=1280:720,setsar=1[v1];[v0][0:a][v1][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" joined.mp4
```

## Audio

```bash
ffmpeg -i in.mp4 -an out_silent.mp4                                        # remove audio
ffmpeg -i in.mp4 -i music.mp3 -map 0:v -map 1:a -c:v copy -shortest out.mp4  # replace audio
ffmpeg -i in.mp4 -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:v copy out.mp4     # normalise loudness
ffmpeg -i in.mp4 -af "volume=1.5" -c:v copy out.mp4                        # 150% volume
ffmpeg -i in.mp4 -af "afade=t=in:d=2" -c:v copy out.mp4                    # 2 s fade-in
```

## Frames and images

```bash
ffmpeg -i in.mp4 -vf fps=1 frames/frame_%04d.png                           # one frame per second
ffmpeg -i in.mp4 -vf "select='gt(scene,0.4)'" -vsync vfr scenes_%03d.jpg   # one frame per scene change
ffmpeg -framerate 30 -i img_%04d.png -c:v libx264 -pix_fmt yuv420p out.mp4  # images → video
ffmpeg -loop 1 -i cover.jpg -i audio.mp3 -c:v libx264 -tune stillimage -c:a aac -shortest -pix_fmt yuv420p out.mp4  # still + audio
```

## Subtitles and overlays

```bash
ffmpeg -i in.mp4 -vf "subtitles=subs.srt" out.mp4                          # burn in
ffmpeg -i in.mp4 -i subs.srt -c copy -c:s mov_text out.mp4                 # soft subs in mp4
ffmpeg -i in.mp4 -i logo.png -filter_complex "overlay=W-w-20:H-h-20" -c:a copy out.mp4  # watermark bottom-right
ffmpeg -i in.mp4 -vf "drawtext=text='Hello':x=(w-tw)/2:y=h-th-40:fontsize=48:fontcolor=white:box=1:boxcolor=black@0.5" out.mp4
```

## Inspection

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 in.mp4          # duration in seconds
ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of csv=p=0 in.mp4  # frame count
ffmpeg -i in.mp4 -af silencedetect=noise=-30dB:d=1 -f null - 2>&1 | grep silence_   # find silent parts
ffmpeg -i in.mp4 -vf blackdetect=d=0.5 -f null - 2>&1 | grep black_                  # find black frames
```
