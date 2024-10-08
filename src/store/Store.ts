import { makeAutoObservable } from 'mobx';
import { fabric } from 'fabric';
import { getUid, isHtmlAudioElement, isHtmlImageElement, isHtmlVideoElement } from '@/utils';
import anime, { get } from 'animejs';
import { MenuOption, EditorElement, Animation, TimeFrame, VideoEditorElement, AudioEditorElement, Placement, ImageEditorElement, Effect, TextEditorElement } from '../types';
import { FabricUitls } from '@/utils/fabric-utils';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { PiWarningDiamondThin } from 'react-icons/pi';

export class Store {
  canvas: fabric.Canvas | null

  backgroundColor: string;

  selectedMenuOption: MenuOption;
  audios: string[]
  videos: string[]
  images: string[]
  editorElements: EditorElement[]
  selectedElement: EditorElement | null;

  maxTime: number
  animations: Animation[]
  animationTimeLine: anime.AnimeTimelineInstance;
  playing: boolean;

  currentKeyFrame: number;
  fps: number;

  possibleVideoFormats: string[] = ['mp4', 'webm'];
  selectedVideoFormat: 'mp4' | 'webm';

  constructor() {
    this.canvas = null;
    this.videos = [];
    this.images = [];
    this.audios = [];
    this.editorElements = [];
    this.backgroundColor = '#0037ff';
    this.maxTime = 60 * 1000;
    this.playing = false;
    this.currentKeyFrame = 0;
    this.selectedElement = null;
    this.fps = 60;
    this.animations = [];
    this.animationTimeLine = anime.timeline();
    this.selectedMenuOption = 'Video';
    this.selectedVideoFormat = 'mp4';

    // Preload particular video assets (alphas)
    this.preloadVideos();

    makeAutoObservable(this);
  }

  

  // Method to preload videos (aplhas)
  preloadVideos() {
    const preloadedVideos = [
      '/videos/Track Tales Intro Audio fixed.mp4',
      '/videos/left_alphas.webm',
      '/videos/blue transition mov.webm',
      '/videos/Spiral.webm',
      '/videos/Endplate_Copyright.mp4'
    ];

    this.setVideos(preloadedVideos);
  }

  get canvasHeight() {
    return 450;
  }

  get canvasWidth() {
    return 800;
  }

  get canvasAspectRatio() {
    return this.canvasWidth / this.canvasHeight;
  }

  get currentTimeInMs() {
    return this.currentKeyFrame * 1000 / this.fps;
  }

  setCurrentTimeInMs(time: number) {
    this.currentKeyFrame = Math.floor(time / 1000 * this.fps);
  }

  setSelectedMenuOption(selectedMenuOption: MenuOption) {
    this.selectedMenuOption = selectedMenuOption;
  }

  setCanvas(canvas: fabric.Canvas | null) {
    this.canvas = canvas;
    if (canvas) {
      canvas.backgroundColor = this.backgroundColor;
    }
  }

  setBackgroundColor(backgroundColor: string) {
    this.backgroundColor = backgroundColor;
    if (this.canvas) {
      this.canvas.backgroundColor = backgroundColor;
    }
  }

  updateEffect(id: string, effect: Effect) {
    const index = this.editorElements.findIndex((element) => element.id === id);
    const element = this.editorElements[index];
    if (isEditorVideoElement(element) || isEditorImageElement(element)) {
      element.properties.effect = effect;
    }
    this.refreshElements();
  }

  setVideos(videos: string[]) {
    this.videos = videos;
  }

  addVideoResource(video: string) {
    this.videos = [...this.videos, video];
    console.log("videos after adding new video resource are: ", this.videos);
  }
  deleteVideoResource(video: string) {
    this.videos = this.videos.filter((v) => v !== video);
  }
  addAudioResource(audio: string) {
    this.audios = [...this.audios, audio];
  }
  addImageResource(image: string) {
    this.images = [...this.images, image];
  }

  addAnimation(animation: Animation) {
    this.animations = [...this.animations, animation];
    this.refreshAnimations();
  }
  updateAnimation(id: string, animation: Animation) {
    const index = this.animations.findIndex((a) => a.id === id);
    this.animations[index] = animation;
    this.refreshAnimations();
  }

  refreshAnimations() {
    anime.remove(this.animationTimeLine);
    this.animationTimeLine = anime.timeline({
      duration: this.maxTime,
      autoplay: false,
    });
    for (let i = 0; i < this.animations.length; i++) {
      const animation = this.animations[i];
      const editorElement = this.editorElements.find((element) => element.id === animation.targetId);
      const fabricObject = editorElement?.fabricObject;
      if (!editorElement || !fabricObject) {
        continue;
      }
      fabricObject.clipPath = undefined;
      switch (animation.type) {
        case "fadeIn": {
          this.animationTimeLine.add({
            opacity: [0, 1],
            duration: animation.duration,
            targets: fabricObject,
            easing: 'linear',
          }, editorElement.timeFrame.start);
          break;
        }
        case "fadeOut": {
          this.animationTimeLine.add({
            opacity: [1, 0],
            duration: animation.duration,
            targets: fabricObject,
            easing: 'linear',
          }, editorElement.timeFrame.end - animation.duration);
          break
        }
        case "slideIn": {
          const direction = animation.properties.direction;
          const targetPosition = {
            left: editorElement.placement.x,
            top: editorElement.placement.y,
          }
          const startPosition = {
            left: (direction === "left" ? - editorElement.placement.width : direction === "right" ? this.canvas?.width : editorElement.placement.x),
            top: (direction === "top" ? - editorElement.placement.height : direction === "bottom" ? this.canvas?.height : editorElement.placement.y),
          }
          if (animation.properties.useClipPath) {
            const clipRectangle = FabricUitls.getClipMaskRect(editorElement, 50);
            fabricObject.set('clipPath', clipRectangle)
          }
          if (editorElement.type === "text" && animation.properties.textType === "character") {
            this.canvas?.remove(...editorElement.properties.splittedTexts)
            // @ts-ignore
            editorElement.properties.splittedTexts = getTextObjectsPartitionedByCharacters(editorElement.fabricObject, editorElement);
            editorElement.properties.splittedTexts.forEach((textObject) => {
              this.canvas!.add(textObject);
            })
            const duration = animation.duration / 2;
            const delay = duration / editorElement.properties.splittedTexts.length;
            for (let i = 0; i < editorElement.properties.splittedTexts.length; i++) {
              const splittedText = editorElement.properties.splittedTexts[i];
              const offset = {
                left: splittedText.left! - editorElement.placement.x,
                top: splittedText.top! - editorElement.placement.y
              }
              this.animationTimeLine.add({
                left: [startPosition.left! + offset.left, targetPosition.left + offset.left],
                top: [startPosition.top! + offset.top, targetPosition.top + offset.top],
                delay: i * delay,
                duration: duration,
                targets: splittedText,
              }, editorElement.timeFrame.start);
            }
            this.animationTimeLine.add({
              opacity: [1, 0],
              duration: 1,
              targets: fabricObject,
              easing: 'linear',
            }, editorElement.timeFrame.start);
            this.animationTimeLine.add({
              opacity: [0, 1],
              duration: 1,
              targets: fabricObject,
              easing: 'linear',
            }, editorElement.timeFrame.start + animation.duration);

            this.animationTimeLine.add({
              opacity: [0, 1],
              duration: 1,
              targets: editorElement.properties.splittedTexts,
              easing: 'linear',
            }, editorElement.timeFrame.start);
            this.animationTimeLine.add({
              opacity: [1, 0],
              duration: 1,
              targets: editorElement.properties.splittedTexts,
              easing: 'linear',
            }, editorElement.timeFrame.start + animation.duration);
          }
          this.animationTimeLine.add({
            left: [startPosition.left, targetPosition.left],
            top: [startPosition.top, targetPosition.top],
            duration: animation.duration,
            targets: fabricObject,
            easing: 'linear',
          }, editorElement.timeFrame.start);
          break
        }
        case "slideOut": {
          const direction = animation.properties.direction;
          const startPosition = {
            left: editorElement.placement.x,
            top: editorElement.placement.y,
          }
          const targetPosition = {
            left: (direction === "left" ? - editorElement.placement.width : direction === "right" ? this.canvas?.width : editorElement.placement.x),
            top: (direction === "top" ? -100 - editorElement.placement.height : direction === "bottom" ? this.canvas?.height : editorElement.placement.y),
          }
          if (animation.properties.useClipPath) {
            const clipRectangle = FabricUitls.getClipMaskRect(editorElement, 50);
            fabricObject.set('clipPath', clipRectangle)
          }
          this.animationTimeLine.add({
            left: [startPosition.left, targetPosition.left],
            top: [startPosition.top, targetPosition.top],
            duration: animation.duration,
            targets: fabricObject,
            easing: 'linear',
          }, editorElement.timeFrame.end - animation.duration);
          break
        }
        case "breathe": {
          const itsSlideInAnimation = this.animations.find((a) => a.targetId === animation.targetId && (a.type === "slideIn"));
          const itsSlideOutAnimation = this.animations.find((a) => a.targetId === animation.targetId && (a.type === "slideOut"));
          const timeEndOfSlideIn = itsSlideInAnimation ? editorElement.timeFrame.start + itsSlideInAnimation.duration : editorElement.timeFrame.start;
          const timeStartOfSlideOut = itsSlideOutAnimation ? editorElement.timeFrame.end - itsSlideOutAnimation.duration : editorElement.timeFrame.end;
          if (timeEndOfSlideIn > timeStartOfSlideOut) {
            continue;
          }
          const duration = timeStartOfSlideOut - timeEndOfSlideIn;
          const easeFactor = 4;
          const suitableTimeForHeartbeat = 1000 * 60 / 72 * easeFactor
          const upScale = 1.05;
          const currentScaleX = fabricObject.scaleX ?? 1;
          const currentScaleY = fabricObject.scaleY ?? 1;
          const finalScaleX = currentScaleX * upScale;
          const finalScaleY = currentScaleY * upScale;
          const totalHeartbeats = Math.floor(duration / suitableTimeForHeartbeat);
          if (totalHeartbeats < 1) {
            continue;
          }
          const keyframes = [];
          for (let i = 0; i < totalHeartbeats; i++) {
            keyframes.push({ scaleX: finalScaleX, scaleY: finalScaleY });
            keyframes.push({ scaleX: currentScaleX, scaleY: currentScaleY });
          }

          this.animationTimeLine.add({
            duration: duration,
            targets: fabricObject,
            keyframes,
            easing: 'linear',
            loop: true
          }, timeEndOfSlideIn);

          break
        }
      }
    }
  }

  removeAnimation(id: string) {
    this.animations = this.animations.filter(
      (animation) => animation.id !== id
    );
    this.refreshAnimations();
  }

  setSelectedElement(selectedElement: EditorElement | null) {
    this.selectedElement = selectedElement;
    console.warn(this.canvas)
    console.warn(selectedElement?.fabricObject)
    if (this.canvas) {
      if (selectedElement?.fabricObject)
        {
          this.canvas.setActiveObject(selectedElement.fabricObject);
          console.warn("this element is set active " + selectedElement.fabricObject)
        }
      else
        this.canvas.discardActiveObject();
    }
  }
  updateSelectedElement() {
    console.error("now updating selected element")
    this.selectedElement = this.editorElements.find((element) => element.id === this.selectedElement?.id) ?? null;
  }

  canvasContainerClicked(event: React.MouseEvent<HTMLDivElement>) {
    // console.warn("canvas container clicked and store function execurted");
    if(event?.target instanceof HTMLCanvasElement){
      // console.warn("in m inside");
      return;
    }
    this.setSelectedElement(null);
  }

  setEditorElements(editorElements: EditorElement[]) {
    this.editorElements = editorElements;
    this.updateSelectedElement();
    this.refreshElements();
    // this.refreshAnimations();
  }

  updateEditorElement(editorElement: EditorElement) {
    this.setEditorElements(this.editorElements.map((element) =>
      element.id === editorElement.id ? editorElement : element
    ));
  }

  updateEditorElementTimeFrame(editorElement: EditorElement, timeFrame: Partial<TimeFrame>) {
    if (timeFrame.start != undefined && timeFrame.start < 0) {
      timeFrame.start = 0;
    }
    if (timeFrame.end != undefined && timeFrame.end > this.maxTime) {
      timeFrame.end = this.maxTime;
    }
    console.log("this is old editor element ", editorElement);
    const newEditorElement = {
      ...editorElement,
      timeFrame: {
        ...editorElement.timeFrame,
        ...timeFrame,
      }
    }
    console.log("this is new editor element ", newEditorElement);
    this.updateVideoElements();
    this.updateAudioElements();
    this.updateEditorElement(newEditorElement);
    this.refreshAnimations();
  }


  addEditorElement(editorElement: EditorElement) {
    if(editorElement.timeFrame.end > this.maxTime) {
      this.setMaxTime(editorElement.timeFrame.end);
      // this.maxTime = editorElement.timeFrame.end;
      console.log("max time is ", this.maxTime);
    } else {
      console.log("editorElement.timeFrame.end is ", editorElement.timeFrame.end);
    }
    this.setEditorElements([...this.editorElements, editorElement]);
    this.refreshElements();
    this.setSelectedElement(this.editorElements[this.editorElements.length - 1]);
  }

  removeEditorElement(id: string) {
    this.setEditorElements(this.editorElements.filter(
      (editorElement) => editorElement.id !== id
    ));
    this.refreshElements();
  }

  setMaxTime(maxTime: number) {
    this.maxTime = maxTime;
  }


  setPlaying(playing: boolean) {
    this.playing = playing;
    this.updateVideoElements();
    this.updateAudioElements();
    if (playing) {
      this.startedTime = Date.now();
      this.startedTimePlay = this.currentTimeInMs
      requestAnimationFrame(() => {
        this.playFrames();
      });
    }
  }

  startedTime = 0;
  startedTimePlay = 0;

  playFrames() {
    if (!this.playing) {
      return;
    }
    const elapsedTime = Date.now() - this.startedTime;
    const newTime = this.startedTimePlay + elapsedTime;
    this.updateTimeTo(newTime);
    if (newTime > this.maxTime) {
      this.currentKeyFrame = 0;
      this.setPlaying(false);
    } else {
      requestAnimationFrame(() => {
        this.playFrames();
      });
    }
  }

  updateTimeTo(newTime: number) {
    this.setCurrentTimeInMs(newTime);
    this.animationTimeLine.seek(newTime);
    if (this.canvas) {
      this.canvas.backgroundColor = this.backgroundColor;
    }
    this.editorElements.forEach(
      e => {
        if (!e.fabricObject) return;
        const isInside = e.timeFrame.start <= newTime && newTime <= e.timeFrame.end;
        e.fabricObject.visible = isInside;
      }
    )
  }

  handleSeek(seek: number) {
    if (this.playing) {
      this.setPlaying(false);
    }
    this.updateTimeTo(seek);
    this.updateVideoElements();
    this.updateAudioElements();
  }

  addVideo(index: number) {
    const videoElement = document.getElementById(`video-${index}`)
    console.log("video element's index is ", videoElement, index);
    if (!isHtmlVideoElement(videoElement)) {
      return;
    }
    const videoDurationMs = videoElement.duration * 1000;
    const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
    const id = getUid();
    // console.log("video id is ", id);
    if (index < 5){
      this.addEditorElement(
        {
          id,
          name: `Media(video) ${index + 1} ${videoElement.localName}`,
          type: "video",
          placement: {
            x: 0,
            y: 0,
            width: this.canvasWidth,
            height: this.canvasHeight,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
          },
          timeFrame: {
            start: 0,
            end: videoDurationMs,
          },
          properties: {
            elementId: `video-${id}`,
            src: videoElement.src,
            effect: {
              type: "none",
            }
          },
        },
      );
    } else {
      this.addEditorElement(
        {
          id,
          name: `Media(video) ${index + 1}`,
          type: "video",
          placement: {
            x: 400 - 50 * aspectRatio,
            y: 175,
            width: 100 * aspectRatio,
            height: 100,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
          },
          timeFrame: {
            start: 0,
            end: videoDurationMs,
          },
          properties: {
            elementId: `video-${id}`,
            src: videoElement.src,
            effect: {
              type: "none",
            }
          },
        },
      );
    }

    console.log("video element is ", videoElement);
    console.log("video duration is ", videoDurationMs);
    console.log("video element src is ", videoElement.src)
  }

  // addVideo(index: number) {
  //   const videoElement = document.getElementById(`video-${index}`);
  //   console.log("video element's index is ", videoElement, index);
  //   if (!isHtmlVideoElement(videoElement)) {
  //     return;
  //   }
  
  //   const videoDurationMs = videoElement.duration * 1000;
  //   const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
  //   const id = getUid();
  
  //   // const canvas = this.canvas;
  //   const fabricVideo = new fabric.Image(videoElement, {
  //     left: index < 5 ? 0 : 400 - 50 * aspectRatio,
  //     top: index < 5 ? 0 : 175,
  //     scaleX: this.canvasWidth / videoElement.videoWidth,
  //     scaleY: this.canvasHeight / videoElement.videoHeight,
  //     // id: `video-${id}`,  // Setting the id for reference
  //   });
  
  //   // canvas.add(fabricVideo);
  //   this.addEditorElement({
  //     id,
  //     name: `Media(video) ${index + 1}`,
  //     type: "video",
  //     placement: {
  //       x: fabricVideo.left!,
  //       y: fabricVideo.top!,
  //       width: fabricVideo.width!,
  //       height: fabricVideo.height!,
  //       rotation: 0,
  //       scaleX: fabricVideo.scaleX!,
  //       scaleY: fabricVideo.scaleY!,
  //     },
  //     timeFrame: {
  //       start: 0,
  //       end: videoDurationMs,
  //     },
  //     properties: {
  //       elementId: `video-${id}`,
  //       src: videoElement.src,
  //       effect: {
  //         type: "none",
  //       },
  //     },
  //   });
  
  //   // Ensure canvas renders the video correctly
  //   videoElement.play();
  //   videoElement.loop = true;  // For continuous rendering
  
  //   // fabric.util.requestAnimFrame(() => {
  //   //   fabricVideo.setElement(videoElement);
  //   //   canvas.renderAll();
  //   // });
  // }
  

  addImage(index: number) {
    const imageElement = document.getElementById(`image-${index}`)
    if (!isHtmlImageElement(imageElement)) {
      return;
    }
    const aspectRatio = imageElement.naturalWidth / imageElement.naturalHeight;
    const id = getUid();
    this.addEditorElement(
      {
        id,
        name: `Media(image) ${index + 1}`,
        type: "image",
        placement: {
          x: 0,
          y: 0,
          width: 100 * aspectRatio,
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
        },
        timeFrame: {
          start: 0,
          end: this.maxTime,
        },
        properties: {
          elementId: `image-${id}`,
          src: imageElement.src,
          effect: {
            type: "none",
          }
        },
      },
    );
  }

  addAudio(index: number) {
    const audioElement = document.getElementById(`audio-${index}`)
    if (!isHtmlAudioElement(audioElement)) {
      return;
    }
    const audioDurationMs = audioElement.duration * 1000;
    const id = getUid();
    this.addEditorElement(
      {
        id,
        name: `Media(audio) ${index + 1}`,
        type: "audio",
        placement: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
        },
        timeFrame: {
          start: 0,
          end: audioDurationMs,
        },
        properties: {
          elementId: `audio-${id}`,
          src: audioElement.src,
        }
      },
    );

  }

  addText(options: {
    text: string,
    fontSize: number,
    fontWeight: number,
    fontFamily: string,
    hasControls?: boolean,
    coordinates?: {
      x?: number,
      y?: number,
    }
  }) {
    const id = getUid();
    const index = this.editorElements.length;
    this.addEditorElement(
      {
        id,
        name: `Text ${index + 1}: ${options.text}`,
        type: "text",
        placement: {
          // x: options.coordinates?.x ?? (this.canvasWidth * 7 / 12),
          // y: options.coordinates?.y?? (this.canvasHeight * 1 / 3),
          x: 0,
          y: 0,
          width: 150,
          height: 80,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
        },
        timeFrame: {
          start: 0,
          end: this.maxTime,
        },
        properties: {
          text: options.text,
          fontSize: options.fontSize,
          fontWeight: options.fontWeight,
          splittedTexts: [],
          fontFamily: options.fontFamily,
          hasControls: options.hasControls ?? true,
        },
      },
    );
  }

  updateVideoElements() {
    this.editorElements.filter(
      (element): element is VideoEditorElement =>
        element.type === "video"
    )
      .forEach((element) => {
        const video = document.getElementById(element.properties.elementId);
        if (isHtmlVideoElement(video)) {
          const videoTime = (this.currentTimeInMs - element.timeFrame.start) / 1000;
          video.currentTime = videoTime;
          if (this.playing) {
            video.play();
          } else {
            video.pause();
          }
        }
      })
  }
  
  updateAudioElements() {
    this.editorElements.filter(
      (element): element is AudioEditorElement =>
        element.type === "audio"
    )
      .forEach((element) => {
        const audio = document.getElementById(element.properties.elementId);
        if (isHtmlAudioElement(audio)) {
          const audioTime = (this.currentTimeInMs - element.timeFrame.start) / 1000;
          audio.currentTime = audioTime;
          if (this.playing) {
            audio.play();
          } else {
            audio.pause();
          }
        }
      })
  }
  // saveCanvasToVideo() {
  //   const video = document.createElement("video");
  //   const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  //   const stream = canvas.captureStream();
  //   video.srcObject = stream;
  //   video.play();
  //   const mediaRecorder = new MediaRecorder(stream);
  //   const chunks: Blob[] = [];
  //   mediaRecorder.ondataavailable = function (e) {
  //     console.log("data available");
  //     console.log(e.data);
  //     chunks.push(e.data);
  //   };
  //   mediaRecorder.onstop = function (e) {
  //     const blob = new Blob(chunks, { type: "video/webm" });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;sir khud chn
  //     a.download = "video.webm";
  //     a.click();
  //   };
  //   mediaRecorder.start();
  //   setTimeout(() => {
  //     mediaRecorder.stop();
  //   }, this.maxTime);

  // }

  setVideoFormat(format: 'mp4' | 'webm') {
    this.selectedVideoFormat = format;
  }

  saveCanvasToVideoWithAudio() {
    this.saveCanvasToVideoWithAudioWebmMp4();
  }

  saveCanvasToVideoWithAudioWebmMp4() {
    console.log('modified')
    let mp4 = this.selectedVideoFormat === 'mp4'

    // Captures a stream from the canvas element at 30 frames per second.
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const stream = canvas.captureStream(30);
    
    
    const audioElements = this.editorElements.filter(isEditorAudioElement)
    console.log("audio elements ", audioElements);
    const audioStreams: MediaStream[] = [];
    
    audioElements.forEach((audio) => {
      const audioElement = document.getElementById(audio.properties.elementId) as HTMLAudioElement;
      let ctx = new AudioContext();
      let sourceNode = ctx.createMediaElementSource(audioElement);
      let dest = ctx.createMediaStreamDestination();
      sourceNode.connect(dest);
      sourceNode.connect(ctx.destination);
      audioStreams.push(dest.stream);
    });
    
    audioStreams.forEach((audioStream) => {
      stream.addTrack(audioStream.getAudioTracks()[0]);
      console.log("audioStream.getAudioTracks()[0] ", audioStream.getAudioTracks()[0]);
    });
    
    
    const video = document.createElement("video");
    video.srcObject = stream;
    video.height = this.canvasHeight;
    console.log("final video height (canvas height) - ", video.height);
    video.width = video.height * this.canvasAspectRatio;
    // video.controls = true;
    // document.body.appendChild(video);
    video.play().then(() => {
      // const mediaRecorder = new MediaRecorder(stream);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8' });
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = function (e) {
        console.log("data size is ", e.data.size);
        chunks.push(e.data);
        console.log("data available");
      };
      mediaRecorder.onstop = async function (e) {
        const blob = new Blob(chunks, { type: "video/webm" });

        if (mp4) {
          // lets use ffmpeg to convert webm to mp4
          const data = new Uint8Array(await (blob).arrayBuffer());
          console.log("data ", data);
          const ffmpeg = new FFmpeg();
          // const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd"
          const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd"
          console.log("baseURL ", baseURL);
          await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            // workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
            workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
          });
          await ffmpeg.writeFile('video.webm', data);
          await ffmpeg.exec(['-i', 'video.webm', 'output.mp4']);
          // await ffmpeg.exec(["-y", "-i", "video.webm", "-c", "copy", "video.mp4"]); // this is COMMENTED
          // await ffmpeg.exec(["-y", "-i", "video.webm", "-c:v", "libx264", "video.mp4"]);

          // const output = await ffmpeg.readFile('video.mp4'); // this is COMMENTED
          const output = await ffmpeg.readFile('output.mp4');
          const outputBlob = new Blob([output], { type: "video/mp4" });
          const outputUrl = URL.createObjectURL(outputBlob);
          const a = document.createElement("a");
          a.href = outputUrl;
          a.download = "Track_Tale.mp4";
          a.click();

        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;

          a.download = "Track_Tale.webm";
          console.log("a.download is ", a.download);
          a.click();
          console.log("a.click() called");
        }
      };
      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, this.maxTime);
      video.remove();
    })
  }

  refreshElements() {
    const store = this;
    if (!store.canvas) return;
    const canvas = store.canvas;
    store.canvas.remove(...store.canvas.getObjects());
    for (let index = 0; index < store.editorElements.length; index++) {
      const element = store.editorElements[index];
      switch (element.type) {
        case "video": {
          console.log("elementid", element.properties.elementId);
          if (document.getElementById(element.properties.elementId) == null)
            continue;
          const videoElement = document.getElementById(
            element.properties.elementId
          );
          if (!isHtmlVideoElement(videoElement)) continue;
          // const filters = [];
          // if (element.properties.effect?.type === "blackAndWhite") {
          //   filters.push(new fabric.Image.filters.Grayscale());
          // }
          const videoObject = new fabric.CoverVideo(videoElement, {
            name: element.id,
            left: element.placement.x,
            top: element.placement.y,
            width: element.placement.width,
            height: element.placement.height,
            scaleX: element.placement.scaleX,
            scaleY: element.placement.scaleY,
            angle: element.placement.rotation,
            objectCaching: false,
            selectable: true,
            lockUniScaling: true,
            // filters: filters,
            // @ts-ignore
            customFilter: element.properties.effect.type,
          });

          element.fabricObject = videoObject;
          element.properties.imageObject = videoObject;
          videoElement.width = 100;
          videoElement.height =
            (videoElement.videoHeight * 100) / videoElement.videoWidth;
          canvas.add(videoObject);
          canvas.on("object:modified", function (e) {
            if (!e.target) return;
            const target = e.target;
            if (target != videoObject) return;
            const placement = element.placement;
            const newPlacement: Placement = {
              ...placement,
              x: target.left ?? placement.x,
              y: target.top ?? placement.y,
              rotation: target.angle ?? placement.rotation,
              width:
                target.width && target.scaleX
                  ? target.width * target.scaleX
                  : placement.width,
              height:
                target.height && target.scaleY
                  ? target.height * target.scaleY
                  : placement.height,
              scaleX: 1,
              scaleY: 1,
            };
            const newElement = {
              ...element,
              placement: newPlacement,
            };
            store.updateEditorElement(newElement);
          });
          break;
        }
        case "image": {
          if (document.getElementById(element.properties.elementId) == null){
            console.log("element id is null:", element.properties.elementId);
            continue;
          }
          const imageElement = document.getElementById(
            element.properties.elementId
          );
          if (!isHtmlImageElement(imageElement)) {
            console.log("element is not image element");
            continue;
          }
          // const filters = [];
          // if (element.properties.effect?.type === "blackAndWhite") {
          //   filters.push(new fabric.Image.filters.Grayscale());
          // }
          const imageObject = new fabric.CoverImage(imageElement, {
            name: element.id,
            left: element.placement.x,
            top: element.placement.y,
            angle: element.placement.rotation,
            objectCaching: false,
            selectable: true,
            lockUniScaling: true,
            // filters
            // @ts-ignore
            customFilter: element.properties.effect.type,
          });
          // imageObject.applyFilters();
          element.fabricObject = imageObject;
          element.properties.imageObject = imageObject;
          const image = {
            w: imageElement.naturalWidth,
            h: imageElement.naturalHeight,
          };

          imageObject.width = image.w;
          imageObject.height = image.h;
          imageElement.width = image.w;
          imageElement.height = image.h;
          imageObject.scaleToHeight(image.w);
          imageObject.scaleToWidth(image.h);
          const toScale = {
            x: element.placement.width / image.w,
            y: element.placement.height / image.h,
          };
          imageObject.scaleX = toScale.x * element.placement.scaleX;
          imageObject.scaleY = toScale.y * element.placement.scaleY;
          // imageObject.shadow = new fabric.Shadow({
          //   color: "rgba(255,0,0,0.5)",
          //   blur: 10,
          //   offsetX: 10,
          //   offsetY: 10,
          // });
          canvas.add(imageObject);
          canvas.on("object:modified", function (e) {
            if (!e.target) return;
            const target = e.target;
            if (target != imageObject) return;
            const placement = element.placement;
            let fianlScale = 1;
            if (target.scaleX && target.scaleX > 0) {
              fianlScale = target.scaleX / toScale.x;
            }
            const newPlacement: Placement = {
              ...placement,
              x: target.left ?? placement.x,
              y: target.top ?? placement.y,
              rotation: target.angle ?? placement.rotation,
              scaleX: fianlScale,
              scaleY: fianlScale,
            };
            const newElement = {
              ...element,
              placement: newPlacement,
            };
            store.updateEditorElement(newElement);
          });
          break;
        }
        case "audio": {
          break;
        }
        case "text": {
          const textObject = new fabric.Textbox(element.properties.text, {
            name: element.properties.text,
            left: element.placement.x,
            top: element.placement.y,
            scaleX: element.placement.scaleX,
            scaleY: element.placement.scaleY,
            width: element.placement.width,
            height: element.placement.height,
            angle: element.placement.rotation,
            fontSize: element.properties.fontSize,
            fontWeight: element.properties.fontWeight,
            objectCaching: false,
            selectable: true,
            lockUniScaling: true,
            fill: "#ffffff",
            backgroundColor: "#0037ff",
            padding: 1,
            // isWrapping: false, // not working
            fontFamily: element.properties.fontFamily,
            hasControls: element.properties.hasControls ?? true,
            // lockScalingX: !element.properties.isScalable ?? false,
            // lockScalingY: true,
          });
          // console.log("text object is ", textObject);
          element.fabricObject = textObject;
          canvas.add(textObject);
          // console.log("Font Family is "+textObject.fontFamily);
          canvas.on("object:modified", function (e) {
            if (!e.target) return;
            const target = e.target;
            if (target != textObject) return;
            const oldPlacement = element.placement;
            const newPlacement: Placement = {
              ...oldPlacement,
              x: target.left ?? oldPlacement.x,
              y: target.top ?? oldPlacement.y,
              rotation: target.angle ?? oldPlacement.rotation,
              width: target.width ?? oldPlacement.width,
              height: target.height ?? oldPlacement.height,
              scaleX: target.scaleX ?? oldPlacement.scaleX,
              scaleY: target.scaleY ?? oldPlacement.scaleY,
            };
            var placement_of_object = element.properties.hasControls ? newPlacement : oldPlacement;
            const newElement = {
              ...element,
              placement: placement_of_object,
              properties: {
                ...element.properties,
                // @ts-ignore
                text: target?.text,
              },
            };
            store.updateEditorElement(newElement);
          });
          break;
        }
        default: {
          throw new Error("Not implemented");
        }
      }
      if (element.fabricObject) {
        element.fabricObject.on("selected", function (e) {
          console.warn("this object is selected now", element.fabricObject);
          store.setSelectedElement(element);
        });
      }
    }
    const selectedEditorElement = store.selectedElement;
    if (selectedEditorElement && selectedEditorElement.fabricObject) {
      canvas.setActiveObject(selectedEditorElement.fabricObject);
    }
    this.refreshAnimations();
    this.updateTimeTo(this.currentTimeInMs);
    store.canvas.renderAll();
  }



  // serialize() {
  //   return JSON.stringify({
  //     // canvas: this.canvas,
  //     backgroundColor: this.backgroundColor,
  //     selectedMenuOption: this.selectedMenuOption,
  //     audios: this.audios,
  //     videos: this.videos,
  //     images: this.images,
  //     editorElements: this.editorElements,
  //     selectedElement: this.selectedElement,
  //     maxTime: this.maxTime,
  //     animations: this.animations,
  //     animationTimeLine: this.animationTimeLine,
  //     playing: this.playing,
  //     currentKeyFrame: this.currentKeyFrame,
  //     fps: this.fps,
  //     possibleVideoFormats: this.possibleVideoFormats,
  //     selectedVideoFormat: this.selectedVideoFormat
  //   });
  // }

  // deserialize(json: string) {
  //   const data = JSON.parse(json);
  //   // this.canvas = data.canvas;
  //   this.backgroundColor = data.backgroundColor;
  //   this.selectedMenuOption = data.selectedMenuOption;
  //   this.audios = data.audios;
  //   this.videos = data.videos;
  //   this.images = data.images;
  //   this.editorElements = data.editorElements;
  //   this.selectedElement = data.selectedElement;
  //   this.maxTime = data.maxTime;
  //   this.animations = data.animations;
  //   this.animationTimeLine = data.animationTimeLine;
  //   this.playing = data.playing;
  //   this.currentKeyFrame = data.currentKeyFrame;
  //   this.fps = data.fps;
  //   this.possibleVideoFormats = data.possibleVideoFormats;
  //   this.selectedVideoFormat = data.selectedVideoFormat;
  // }

  serialize() {
    return JSON.stringify({
      backgroundColor: this.backgroundColor,
      selectedMenuOption: this.selectedMenuOption,
      audios: this.audios,
      videos: this.videos,
      images: this.images,
      // audios: this.audios.map(audio => audio.path), // Store audio paths
      // videos: this.videos.map(video => video.path), // Store video paths
      // images: this.images.map(image => image.path), // Store image paths
      editorElements: this.editorElements,
      selectedElement: this.selectedElement,
      maxTime: this.maxTime,
      animations: this.animations,
      playing: this.playing,
      currentKeyFrame: this.currentKeyFrame,
      fps: this.fps,
      possibleVideoFormats: this.possibleVideoFormats,
      selectedVideoFormat: this.selectedVideoFormat,
    });
  }

  deserialize(state : any) {
    const data = JSON.parse(state);
    this.backgroundColor = data.backgroundColor;
    this.selectedMenuOption = data.selectedMenuOption;
    this.audios = data.audios;
    this.videos = data.videos;
    this.images = data.images;
    // this.audios = data.audios.map(path => this.loadAudio(path)); // Load audio files
    // this.videos = data.videos.map(path => this.loadVideo(path)); // Load video files
    // this.images = data.images.map(path => this.loadImage(path)); // Load image files
    
    this.editorElements = data.editorElements;
    this.selectedElement = data.selectedElement;
    this.maxTime = data.maxTime;
    this.animations = data.animations;
    this.playing = data.playing;
    this.currentKeyFrame = data.currentKeyFrame;
    this.fps = data.fps;
    this.possibleVideoFormats = data.possibleVideoFormats;
    this.selectedVideoFormat = data.selectedVideoFormat;
  }


  // loadAudio(path) {
  //   const audio = new Audio(path);
  //   // Additional setup for the audio element if needed
  //   return audio;
  // }

  // loadVideo(path) {
  //   const video = document.createElement('video');
  //   video.src = path;
  //   // Additional setup for the video element if needed
  //   return video;
  // }

  // loadImage(path) {
  //   const img = new Image();
  //   img.src = path;
  //   // Additional setup for the image element if needed
  //   return img;
  // }

}

export function isEditorAudioElement(
  element: EditorElement
): element is AudioEditorElement {
  return element.type === "audio";
}

export function isEditorVideoElement(
  element: EditorElement
): element is VideoEditorElement {
  return element.type === "video";
}

export function isEditorImageElement(
  element: EditorElement
): element is ImageEditorElement {
  return element.type === "image";
}


function getTextObjectsPartitionedByCharacters(textObject: fabric.Text, element: TextEditorElement): fabric.Text[] {
  let copyCharsObjects: fabric.Text[] = [];
  // replace all line endings with blank
  const characters = (textObject.text ?? "").split('').filter((m) => m !== '\n');
  const charObjects = textObject.__charBounds;
  if (!charObjects) return [];
  const charObjectFixed = charObjects.map((m, index) => m.slice(0, m.length - 1).map(m => ({ m, index }))).flat();
  const lineHeight = textObject.getHeightOfLine(0);
  for (let i = 0; i < characters.length; i++) {
    if (!charObjectFixed[i]) continue;
    const { m: charObject, index: lineIndex } = charObjectFixed[i];
    const char = characters[i];
    const scaleX = textObject.scaleX ?? 1;
    const scaleY = textObject.scaleY ?? 1;
    const charTextObject = new fabric.Text(char, {
      left: charObject.left * scaleX + (element.placement.x),
      scaleX: scaleX,
      scaleY: scaleY,
      top: lineIndex * lineHeight * scaleY + (element.placement.y),
      fontSize: textObject.fontSize,
      fontWeight: textObject.fontWeight,
      fill: '#fff',
    });
    copyCharsObjects.push(charTextObject);
  }
  return copyCharsObjects;
}

