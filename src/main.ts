import { analyseVideo } from './media/analyse';
import { calculateAudioBitrate, calculateTotalBitrate, calculateVideoBitrate, formatBytes, formatDuration } from './media/bitrate';
import { TARGET_BYTES, type ResolutionChoice, type VideoInfo } from './media/constants';
import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app')!;
const discordMark = `<svg viewBox="0 0 100 76" aria-hidden="true"><path d="M83 12A79 79 0 0 0 64 6l-3 6a71 71 0 0 0-22 0l-3-6a79 79 0 0 0-19 6C5 29 1 46 3 62a78 78 0 0 0 24 12l6-10-8-4 2-2c15 7 31 7 46 0l2 2-8 4 6 10a78 78 0 0 0 24-12c2-19-3-36-14-50Z"/><ellipse cx="36" cy="39" rx="5" ry="7" class="discord-eye"/><ellipse cx="64" cy="39" rx="5" ry="7" class="discord-eye"/></svg>`;
const icon = (path: string) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;

app.innerHTML = `
  <svg class="factory-scene" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="machine" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22263c"/><stop offset=".55" stop-color="#151a2b"/><stop offset="1" stop-color="#101522"/></linearGradient>
      <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#181e31"/><stop offset="1" stop-color="#090d18"/></linearGradient>
      <linearGradient id="belt" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#30364d"/><stop offset=".16" stop-color="#191e2e"/><stop offset="1" stop-color="#111624"/></linearGradient>
      <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#6e71ff" stop-opacity="0"/><stop offset=".35" stop-color="#8b7cff"/><stop offset=".7" stop-color="#58d9ff"/><stop offset="1" stop-color="#58d9ff" stop-opacity="0"/></linearGradient>
      <radialGradient id="halo"><stop stop-color="#626cff" stop-opacity=".24"/><stop offset="1" stop-color="#626cff" stop-opacity="0"/></radialGradient>
      <pattern id="rollers" width="62" height="58" patternUnits="userSpaceOnUse"><path d="M31 4v49" stroke="#77809e" stroke-opacity=".24" stroke-width="2"/><circle cx="31" cy="29" r="10" fill="#20263a" stroke="#8790ad" stroke-opacity=".38" stroke-width="2"/><circle cx="31" cy="29" r="3" fill="#aab4d5" fill-opacity=".5"/></pattern>
      <filter id="soft-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="14"/></filter>
      <filter id="mark-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7"/></filter>
    </defs>
    <ellipse cx="720" cy="510" rx="620" ry="370" fill="url(#halo)"/>
    <path d="M0 770h1440M0 812h1440M0 852h1440" stroke="#8992bb" stroke-opacity=".05"/>
    <path d="M0 770 390 635h660l390 135M0 850 430 680h580l430 170" fill="none" stroke="#8992bb" stroke-opacity=".035"/>
    <ellipse cx="720" cy="690" rx="625" ry="68" fill="#080b13" opacity=".66" filter="url(#soft-glow)"/>
    <g class="machine-body">
      <path d="M500 363q0-28 28-28h384q28 0 28 28v305H500Z" fill="url(#machine)" stroke="#56607c" stroke-opacity=".45" stroke-width="2"/>
      <path d="M514 372q0-22 22-22h368q22 0 22 22v13H514Z" fill="#333951" opacity=".8"/>
      <path d="M530 404h380v145H530z" fill="url(#glass)" stroke="#727da0" stroke-opacity=".3"/>
      <path d="M544 416h352v116H544z" fill="#11182a" stroke="#9c9dff" stroke-opacity=".22"/>
      <path d="M560 429h320v3H560z" fill="url(#beam)" opacity=".85"/>
      <path d="M566 506h300" stroke="#6872a0" stroke-opacity=".25"/>
      <circle cx="552" cy="370" r="3" fill="#8e97b8"/><circle cx="888" cy="370" r="3" fill="#8e97b8"/>
      <path d="M500 353h440" stroke="#a9a9ff" stroke-opacity=".5" stroke-width="2"/>
      <path d="M519 675v45m390-45v45" stroke="#69728f" stroke-opacity=".38" stroke-width="12"/>
      <path d="M506 720h42m346 0h42" stroke="#69728f" stroke-opacity=".38" stroke-width="8"/>
      <path d="M501 664h438" stroke="#747eff" stroke-opacity=".62" stroke-width="2"/>
      <path d="M623 351v10m194-10v10" stroke="#97a0c0" stroke-opacity=".55" stroke-width="3"/>
      <circle cx="720" cy="472" r="49" fill="none" stroke="#8b83ff" stroke-opacity=".15" stroke-width="1"/>
      <circle cx="720" cy="472" r="37" fill="none" stroke="#67dfff" stroke-opacity=".14" stroke-width="1"/>
    </g>
    <g class="conveyor">
      <path d="M0 641h1440v73H0z" fill="url(#belt)" stroke="#7782a3" stroke-opacity=".46" stroke-width="2"/>
      <path d="M0 650h1440v55H0z" fill="url(#rollers)"/>
      <path d="M0 642h1440M0 713h1440" stroke="#98a2c3" stroke-opacity=".52" stroke-width="3"/>
      <path d="M40 637h182M1218 637h182" stroke="#747eff" stroke-opacity=".65" stroke-width="3"/>
      <path d="M68 730v21m130-21v21m1044-21v21m130-21v21" stroke="#505a77" stroke-width="10" stroke-linecap="round"/>
      <path d="M68 754h130m1044 0h130" stroke="#505a77" stroke-width="7" stroke-linecap="round"/>
    </g>
    <path class="static-mark" d="M83 12A79 79 0 0 0 64 6l-3 6a71 71 0 0 0-22 0l-3-6a79 79 0 0 0-19 6C5 29 1 46 3 62a78 78 0 0 0 24 12l6-10-8-4 2-2c15 7 31 7 46 0l2 2-8 4 6 10a78 78 0 0 0 24-12c2-19-3-36-14-50Z" transform="translate(248 593) scale(.78)" fill="#a9a0ff"/>
    <path class="static-mark" d="M83 12A79 79 0 0 0 64 6l-3 6a71 71 0 0 0-22 0l-3-6a79 79 0 0 0-19 6C5 29 1 46 3 62a78 78 0 0 0 24 12l6-10-8-4 2-2c15 7 31 7 46 0l2 2-8 4 6 10a78 78 0 0 0 24-12c2-19-3-36-14-50Z" transform="translate(1100 619) scale(.3)" fill="#8be9ff"/>
    <g class="moving-token" transform="translate(0 641)">
      <g class="token-mark" transform="translate(-42 -34) scale(.84)">
        <path d="M83 12A79 79 0 0 0 64 6l-3 6a71 71 0 0 0-22 0l-3-6a79 79 0 0 0-19 6C5 29 1 46 3 62a78 78 0 0 0 24 12l6-10-8-4 2-2c15 7 31 7 46 0l2 2-8 4 6 10a78 78 0 0 0 24-12c2-19-3-36-14-50Z" fill="#a89cff" class="token-fill"/>
        <ellipse cx="36" cy="39" rx="5" ry="7" fill="#28234b"/><ellipse cx="64" cy="39" rx="5" ry="7" fill="#28234b"/>
        <animateTransform attributeName="transform" type="scale" values="1;1;.34;.34" keyTimes="0;.37;.63;1" dur="7.2s" repeatCount="indefinite" begin="0s; -2.4s; -4.8s"/>
      </g>
      <animateMotion path="M -145 0 L 1585 0" dur="7.2s" repeatCount="indefinite" begin="0s; -2.4s; -4.8s"/>
    </g>
  </svg>
  <header class="topbar"><div class="brand-mark" role="img" aria-label="Discord">${discordMark}</div><span class="privacy-light" title="Local processing"></span></header>
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
  </main>`;

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
