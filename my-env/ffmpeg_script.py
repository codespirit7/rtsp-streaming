import subprocess

def run_ffmpeg_command(command):
    try:
        subprocess.run(command, check=True, shell=True)
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")

def main():
    input_video = "rtsp://rtspstream:a03ba892fc106d539e252150f59e9c73@zephyr.rtsp.stream/movie"
    output_hls = "./streamOutput/output.m3u8"
    ffmpeg_command = f"ffmpeg -i {input_video} -c:v libx264 -c:a aac -strict experimental -f hls {output_hls}"
   
    run_ffmpeg_command(ffmpeg_command)

if __name__ == "__main__":
    main()
