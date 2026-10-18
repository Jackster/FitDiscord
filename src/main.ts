import { analyseVideo } from './media/analyse';
import { calculateAudioBitrate, calculateTotalBitrate, calculateVideoBitrate, formatBytes, formatDuration } from './media/bitrate';
import { TARGET_BYTES, type ResolutionChoice, type VideoInfo } from './media/constants';
import './styles.css';
import './factory-scene.css';

const app = document.querySelector<HTMLDivElement>('#app')!;
const icon = (path: string) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;

app.innerHTML = `
<section class="hero" aria-label="Discord video compression scene">

  <div class="factory-lines"></div>
  <div class="floor"></div>

  <div class="streaks left" aria-hidden="true">
    <i class="streak"></i><i class="streak"></i><i class="streak"></i>
  </div>
  <div class="streaks right" aria-hidden="true">
    <i class="streak"></i><i class="streak"></i><i class="streak"></i>
  </div>

  <div class="conveyor" aria-hidden="true">
    <div class="belt"></div>
    <div class="rollers">
      <span class="roller"></span><span class="roller"></span><span class="roller"></span>
      <span class="roller"></span><span class="roller"></span><span class="roller"></span>
      <span class="roller"></span><span class="roller"></span><span class="roller"></span>
      <span class="roller"></span><span class="roller"></span><span class="roller"></span>
      <span class="roller"></span><span class="roller"></span><span class="roller"></span>
      <span class="roller"></span><span class="roller"></span><span class="roller"></span>
    </div>
  </div>

  <div class="discord-icon input-icon" aria-hidden="true">
    <div class="ghost g1">
      <svg viewBox="0 0 128 96" aria-hidden="true">
        <path class="discord-fill" d="M20 12c10-5 21-8 33-10l5 10c4-1 8-1 12-1s8 0 12 1l5-10c12 2 23 5 33 10 10 15 12 30 12 43 0 16-5 28-15 39-8 4-17 6-26 7l-8-13c7-2 13-5 19-9-2-1-3-2-5-3-11 5-21 7-31 7s-20-2-31-7c-2 1-3 2-5 3 6 4 12 7 19 9l-8 13c-9-1-18-3-26-7C5 83 0 71 0 55 0 42 2 27 12 12c2 0 5-2 8-3z"/>
        <circle class="discord-cut" cx="48" cy="48" r="8"/>
        <circle class="discord-cut" cx="80" cy="48" r="8"/>
        <path class="discord-cut" d="M40 63c7 6 14 8 24 8s17-2 24-8c-5 9-14 14-24 14S45 72 40 63z"/>
      </svg>
    </div>
    <div class="ghost g2">
      <svg viewBox="0 0 128 96" aria-hidden="true">
        <path class="discord-fill" d="M20 12c10-5 21-8 33-10l5 10c4-1 8-1 12-1s8 0 12 1l5-10c12 2 23 5 33 10 10 15 12 30 12 43 0 16-5 28-15 39-8 4-17 6-26 7l-8-13c7-2 13-5 19-9-2-1-3-2-5-3-11 5-21 7-31 7s-20-2-31-7c-2 1-3 2-5 3 6 4 12 7 19 9l-8 13c-9-1-18-3-26-7C5 83 0 71 0 55 0 42 2 27 12 12c2 0 5-2 8-3z"/>
        <circle class="discord-cut" cx="48" cy="48" r="8"/>
        <circle class="discord-cut" cx="80" cy="48" r="8"/>
        <path class="discord-cut" d="M40 63c7 6 14 8 24 8s17-2 24-8c-5 9-14 14-24 14S45 72 40 63z"/>
      </svg>
    </div>
    <svg viewBox="0 0 128 96" aria-hidden="true">
      <path class="discord-fill" d="M20 12c10-5 21-8 33-10l5 10c4-1 8-1 12-1s8 0 12 1l5-10c12 2 23 5 33 10 10 15 12 30 12 43 0 16-5 28-15 39-8 4-17 6-26 7l-8-13c7-2 13-5 19-9-2-1-3-2-5-3-11 5-21 7-31 7s-20-2-31-7c-2 1-3 2-5 3 6 4 12 7 19 9l-8 13c-9-1-18-3-26-7C5 83 0 71 0 55 0 42 2 27 12 12c2 0 5-2 8-3z"/>
      <circle class="discord-cut" cx="48" cy="48" r="8"/>
      <circle class="discord-cut" cx="80" cy="48" r="8"/>
      <path class="discord-cut" d="M40 63c7 6 14 8 24 8s17-2 24-8c-5 9-14 14-24 14S45 72 40 63z"/>
    </svg>
  </div>

  <div class="arrows left" aria-hidden="true">›››</div>

  <div class="machine" aria-hidden="true">
    <div class="press-column"></div>
    <div class="machine-body">
      <div class="hazard"></div>
      <div class="window">
        <div class="beam"></div>
        <div class="sparks"></div>
        <div class="discord-icon window-icon">
          <svg viewBox="0 0 128 96" aria-hidden="true">
            <path class="discord-fill" d="M20 12c10-5 21-8 33-10l5 10c4-1 8-1 12-1s8 0 12 1l5-10c12 2 23 5 33 10 10 15 12 30 12 43 0 16-5 28-15 39-8 4-17 6-26 7l-8-13c7-2 13-5 19-9-2-1-3-2-5-3-11 5-21 7-31 7s-20-2-31-7c-2 1-3 2-5 3 6 4 12 7 19 9l-8 13c-9-1-18-3-26-7C5 83 0 71 0 55 0 42 2 27 12 12c2 0 5-2 8-3z"/>
            <circle class="discord-cut" cx="48" cy="48" r="8"/>
            <circle class="discord-cut" cx="80" cy="48" r="8"/>
            <path class="discord-cut" d="M40 63c7 6 14 8 24 8s17-2 24-8c-5 9-14 14-24 14S45 72 40 63z"/>
          </svg>
        </div>
      </div>
      <div class="faceplate"></div>
    </div>
    <div class="press-head"></div>
  </div>

  <div class="arrows right" aria-hidden="true">›››</div>

  <div class="discord-icon output-icon" aria-hidden="true">
    <svg viewBox="0 0 128 96" aria-hidden="true">
      <path class="discord-fill" d="M20 12c10-5 21-8 33-10l5 10c4-1 8-1 12-1s8 0 12 1l5-10c12 2 23 5 33 10 10 15 12 30 12 43 0 16-5 28-15 39-8 4-17 6-26 7l-8-13c7-2 13-5 19-9-2-1-3-2-5-3-11 5-21 7-31 7s-20-2-31-7c-2 1-3 2-5 3 6 4 12 7 19 9l-8 13c-9-1-18-3-26-7C5 83 0 71 0 55 0 42 2 27 12 12c2 0 5-2 8-3z"/>
      <circle class="discord-cut" cx="48" cy="48" r="8"/>
      <circle class="discord-cut" cx="80" cy="48" r="8"/>
      <path class="discord-cut" d="M40 63c7 6 14 8 24 8s17-2 24-8c-5 9-14 14-24 14S45 72 40 63z"/>
    </svg>
  </div>

  <span class="twinkle" aria-hidden="true"></span>
  <span class="twinkle t2" aria-hidden="true"></span>
  <main class="layout">
    <section class="work-card" aria-label="Video compressor">
      <div id="welcome" class="welcome">
        <input id="file-input" type="file" accept="video/*,.mov,.mkv,.webm,.avi,.m4v" hidden />
        <div id="dropzone" class="dropzone" tabindex="0" role="region" aria-label="Drop a video or choose a file">
          <button id="choose-button" class="icon-action upload-action" type="button" aria-label="Upload video" title="Upload video">${icon('M12 16V4m0 0L7 9m5-5 5 5M5 14v5h14v-5')}</button>
        </div>
      </div>
      <div id="editor" class="editor" hidden>
        <div class="file-heading"><div class="file-icon" aria-hidden="true">▶</div><div class="file-text"><strong id="file-name" class="sr-only"></strong><span id="file-details" class="sr-only"></span></div><button id="replace-button" class="icon-action mini-action" aria-label="Choose another video" title="Choose another video">${icon('M20 11a8 8 0 0 0-14.9-4M4 4v4h4M4 13a8 8 0 0 0 14.9 4M20 20v-4h-4')}</button></div>
        <div class="editor-grid"><div class="preview-wrap"><video id="preview" muted playsinline controls preload="metadata"></video></div>
          <div class="settings">
            <div class="target-row sr-only" aria-label="Target size 19.8 megabytes"><span>Target file size</span><strong>19.8 MB</strong></div>
            <label class="sr-only" for="resolution">Output resolution</label><select id="resolution" class="select" aria-label="Output resolution"><option value="original">Original</option><option value="1080">1080p</option><option value="720">720p</option><option value="360">360p</option></select>
            <label class="audio-choice" title="Keep audio"><span class="audio-symbol" aria-hidden="true">${icon('M11 5 6 9H3v6h3l5 4V5Zm4 4a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12')}</span><span class="sr-only"><strong>Keep audio</strong><small id="audio-note">Include the original audio track</small></span><input id="audio-toggle" type="checkbox" checked aria-label="Keep audio" /><span class="switch" aria-hidden="true"></span></label>
            <div id="estimate" class="estimate sr-only"></div>
            <div id="warning" class="warning sr-only" hidden></div>
            <div id="actions" class="actions"><button id="compress-button" class="icon-action compress-action" type="button" aria-label="Compress video" title="Compress video">${icon('M8 5v14l11-7L8 5Z')}</button><button id="original-button" class="icon-action download-action" type="button" aria-label="Download original" title="Download original" hidden>${icon('M12 3v12m0 0 5-5m-5 5-5-5M5 15v5h14v-5')}</button></div>
          </div>
        </div>
        <div id="progress-panel" class="progress-panel" hidden aria-live="polite"><div class="progress-top"><div><span class="sr-only">COMPRESSION IN PROGRESS</span><h3 id="progress-title" class="sr-only">Preparing encoder</h3></div><button id="cancel-button" class="icon-action cancel-action" type="button" aria-label="Cancel compression" title="Cancel">${icon('M6 6l12 12M18 6 6 18')}</button></div><div class="progress-track"><div id="progress-bar"></div></div><div class="progress-meta"><span id="progress-caption" class="sr-only">Preparing video…</span><strong id="progress-percent" class="sr-only">0%</strong></div><div id="pass-note" class="sr-only"></div></div>
        <div id="result-panel" class="result-panel" hidden><span class="result-check sr-only">Compression complete</span><div class="result-copy"><h3 class="sr-only">Ready to share</h3><p id="result-summary" class="sr-only"></p></div><button id="download-button" class="icon-action download-action" type="button" aria-label="Download compressed video" title="Download video">${icon('M12 3v12m0 0 5-5m-5 5-5-5M5 15v5h14v-5')}</button></div>
        <div id="error-panel" class="error-panel" hidden role="alert"><span aria-hidden="true">!</span><p id="error-message" class="sr-only"></p><button id="retry-button" class="icon-action mini-action" type="button" aria-label="Try again" title="Try again">${icon('M20 11a8 8 0 0 0-14.9-4M4 4v4h4M4 13a8 8 0 0 0 14.9 4M20 20v-4h-4')}</button></div>
      </div>
    </section>
  </main>
</section>`;

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const input = $('#file-input') as HTMLInputElement;
const dropzone = $('#dropzone');
const editor = $('#editor');
const resolution = $('#resolution') as HTMLSelectElement;
const audioToggle = $('#audio-toggle') as HTMLInputElement;
const preview = $('#preview') as HTMLVideoElement;

let selectedFile: File | null = null;
let videoInfo: VideoInfo | null = null;
let previewUrl: string | null = null;
let outputUrl: string | null = null;
let worker: Worker | null = null;
let startedAt = 0;
let latestBitrate = 0;

$('#choose-button').addEventListener('click', () => input.click());
$('#replace-button').addEventListener('click', () => input.click());
dropzone.addEventListener('click', (event) => { if (!(event.target as HTMLElement).closest('button')) input.click(); });
dropzone.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); input.click(); } });
input.addEventListener('change', () => { const file = input.files?.[0]; if (file) void selectFile(file); input.value = ''; });

for (const event of ['dragenter', 'dragover']) dropzone.addEventListener(event, (e) => { e.preventDefault(); dropzone.classList.add('is-dragging'); });
for (const event of ['dragleave', 'drop']) dropzone.addEventListener(event, (e) => { e.preventDefault(); dropzone.classList.remove('is-dragging'); });
dropzone.addEventListener('drop', (e) => { const file = (e as DragEvent).dataTransfer?.files[0]; if (file) void selectFile(file); });

resolution.addEventListener('change', updateEstimate);
audioToggle.addEventListener('change', updateEstimate);
$('#compress-button').addEventListener('click', startCompression);
$('#cancel-button').addEventListener('click', cancelCompression);
$('#retry-button').addEventListener('click', startCompression);
$('#download-button').addEventListener('click', () => { if (outputUrl && selectedFile) download(outputUrl, outputName(selectedFile.name)); });
$('#original-button').addEventListener('click', () => {
  if (!selectedFile) return;
  const url = URL.createObjectURL(selectedFile);
  download(url, selectedFile.name);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});

async function selectFile(file: File) {
  if (!file.type.startsWith('video/') && !/\.(mp4|mov|m4v|mkv|webm|avi|mpg|mpeg|3gp)$/i.test(file.name)) {
    showError('Choose a video file such as MP4, MOV, WebM, or MKV.');
    return;
  }
  if (worker) cancelCompression();
  cleanupUrls();
  selectedFile = file;
  videoInfo = null;
  $('#welcome').setAttribute('hidden', '');
  editor.removeAttribute('hidden');
  $('#progress-panel').setAttribute('hidden', '');
  $('#result-panel').setAttribute('hidden', '');
  $('#error-panel').setAttribute('hidden', '');
  $('#actions').removeAttribute('hidden');
  $('#compress-button').setAttribute('disabled', '');
  $('#file-name').textContent = file.name;
  $('#file-details').textContent = `${formatBytes(file.size)} · Reading video details…`;
  previewUrl = URL.createObjectURL(file);
  preview.src = previewUrl;
  try {
    videoInfo = await analyseVideo(file);
    $('#file-details').textContent = `${videoInfo.width} × ${videoInfo.height} · ${formatDuration(videoInfo.duration)} · ${formatBytes(file.size)}${videoInfo.codec ? ` · ${videoInfo.codec.toUpperCase()}` : ''}${videoInfo.frameRate ? ` · ${videoInfo.frameRate.toFixed(0)} fps` : ''} · ${videoInfo.hasAudio ? 'Audio' : 'No audio'}`;
    resolution.value = 'original';
    audioToggle.checked = true;
    $('#audio-note').textContent = videoInfo.hasAudio ? 'Include the original audio track' : 'No audio track detected';
    updateEstimate();
  } catch (error) {
    showError(error instanceof Error ? error.message : 'This video could not be analysed.');
    $('#file-details').textContent = `${formatBytes(file.size)} · Could not read video details`;
    $('#compress-button').setAttribute('disabled', '');
  } finally {
    $('#compress-button').removeAttribute('disabled');
  }
}

function updateEstimate() {
  if (!selectedFile || !videoInfo) return;
  const sameAsSource = resolution.value === 'original' && audioToggle.checked;
  const alreadyFits = selectedFile.size <= TARGET_BYTES && sameAsSource;
  const total = calculateTotalBitrate(videoInfo.duration);
  const audio = calculateAudioBitrate(total, audioToggle.checked && videoInfo.hasAudio);
  latestBitrate = calculateVideoBitrate(total, audio);
  $('#estimate').innerHTML = `<span>Estimated output</span><strong>${alreadyFits ? `${formatBytes(selectedFile.size)} · already within target` : `${formatBytes(selectedFile.size)} <b>→</b> around 19.8 MB`}</strong>`;
  $('#compress-button').setAttribute('aria-label', alreadyFits ? 'Compress anyway' : 'Compress video');
  $('#compress-button').setAttribute('title', alreadyFits ? 'Compress anyway' : 'Compress video');
  $('#original-button').toggleAttribute('hidden', !alreadyFits);
  const warning = $('#warning');
  if (total < 350_000) {
    warning.textContent = `This is a long video. Fitting it below 20 MB means roughly ${Math.round(latestBitrate / 1000)} kbps for video, which may look soft. Try 360p for a better result.`;
    warning.removeAttribute('hidden');
  } else warning.setAttribute('hidden', '');
}

function startCompression() {
  if (!selectedFile || !videoInfo) return;
  if (typeof VideoEncoder === 'undefined' || typeof VideoDecoder === 'undefined') {
    showError('Your browser does not provide the video encoder required for local compression. Please use a current version of Chrome or Edge.');
    return;
  }
  $('#error-panel').setAttribute('hidden', '');
  $('#actions').setAttribute('hidden', '');
  $('#progress-panel').removeAttribute('hidden');
  $('#result-panel').setAttribute('hidden', '');
  $('#progress-bar').setAttribute('style', 'width:0%');
  $('#progress-title').textContent = 'Preparing encoder';
  $('#progress-caption').textContent = 'Preparing video…';
  startedAt = Date.now();
  worker = new Worker(new URL('./workers/compressor.worker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = ({ data }) => {
    if (data.type === 'progress') {
      latestBitrate = data.videoBitrate;
      const progress = Math.max(0, Math.min(1, data.progress || 0));
      $('#progress-title').textContent = data.stage === 'optimising' ? 'Optimising final size' : 'Encoding video';
      $('#progress-caption').textContent = `${formatDuration(videoInfo!.duration * progress)} / ${formatDuration(videoInfo!.duration)} · ${Math.round(data.videoBitrate / 1000)} kbps`;
      $('#progress-percent').textContent = `${Math.round(progress * 100)}%`;
      $('#progress-bar').setAttribute('style', `width:${Math.max(3, progress * 100)}%`);
      $('#pass-note').textContent = `Pass ${data.attempt} of ${data.attempts} · ${Math.floor((Date.now() - startedAt) / 1000)} sec elapsed`;
    } else if (data.type === 'oversize') {
      $('#progress-title').textContent = 'Optimising final size';
      $('#progress-caption').textContent = `${formatBytes(data.bytes)} is a little over the target · adjusting bitrate`;
      $('#progress-percent').textContent = `Pass ${data.attempt - 1}`;
      $('#progress-bar').setAttribute('style', 'width:100%');
    } else if (data.type === 'complete') {
      if (data.bytes > TARGET_BYTES) { showError('The result exceeded the size limit. Please try again at a lower resolution.'); return; }
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      outputUrl = URL.createObjectURL(data.blob);
      $('#progress-panel').setAttribute('hidden', '');
      $('#result-panel').removeAttribute('hidden');
      $('#result-summary').textContent = `${formatBytes(data.bytes)} · ${data.width} × ${data.height} · saved ${((1 - data.bytes / selectedFile!.size) * 100).toFixed(1)}% from original`;
      finishWorker();
    } else if (data.type === 'error') showError(data.message);
  };
  worker.onerror = (event) => { console.error('Compression worker failed:', event.message); showError('Compression stopped unexpectedly. Try again or use a smaller output resolution.'); };
  worker.postMessage({ type: 'start', file: selectedFile, duration: videoInfo.duration, width: videoInfo.width, height: videoInfo.height, frameRate: videoInfo.frameRate, resolution: resolution.value as ResolutionChoice, keepAudio: audioToggle.checked && videoInfo.hasAudio });
}

function cancelCompression() {
  if (worker) { worker.terminate(); worker = null; }
  $('#progress-panel').setAttribute('hidden', '');
  $('#actions').removeAttribute('hidden');
  $('#compress-button').removeAttribute('disabled');
}

function showError(message: string) {
  console.error(message);
  $('#error-message').textContent = message;
  $('#error-panel').removeAttribute('hidden');
  $('#progress-panel').setAttribute('hidden', '');
  $('#actions').removeAttribute('hidden');
  finishWorker();
}

function finishWorker() { worker?.terminate(); worker = null; }
function cleanupUrls() {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  if (outputUrl) URL.revokeObjectURL(outputUrl);
  previewUrl = outputUrl = null;
  preview.removeAttribute('src');
  preview.load();
}
function outputName(name: string) { return `${name.replace(/\.[^.]+$/, '')}-discord.mp4`; }
function download(url: string, name: string) {
  const link = document.createElement('a'); link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
}
