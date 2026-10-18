import { analyseVideo } from './media/analyse';
import { calculateAudioBitrate, calculateTotalBitrate, calculateVideoBitrate, formatBytes, formatDuration } from './media/bitrate';
import { TARGET_BYTES, type ResolutionChoice, type VideoInfo } from './media/constants';
import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app')!;
const dropIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"/></svg>';

app.innerHTML = `
  <header class="topbar"><a class="brand" href="#" aria-label="FitDiscord home"><span class="brand-mark">${dropIcon}</span><span>fit<span class="brand-accent">discord</span></span></a><span class="privacy-chip"><span class="shield">✓</span> Private by design</span></header>
  <main class="layout">
    <section class="intro"><div class="eyebrow"><span></span> THE LOCAL VIDEO COMPRESSOR</div><h1>Make room for<br /><span>the moment.</span></h1><p class="subtitle">Compress videos to Discord’s 20 MB limit.<br class="desktop-break" /> Your video stays right here on your device.</p></section>
    <section class="work-card" aria-label="Video compressor">
      <div id="welcome" class="welcome">
        <input id="file-input" type="file" accept="video/*,.mov,.mkv,.webm,.avi,.m4v" hidden />
        <div id="dropzone" class="dropzone" tabindex="0" role="region" aria-label="Drop a video or choose a file">
          <div class="upload-orb">${dropIcon}</div><h2>Drop a video to get started</h2><p>or choose a file from your device</p><button id="choose-button" class="button button-primary" type="button">Choose a video <span aria-hidden="true">↗</span></button>
          <div class="drop-foot"><span>MP4, MOV, WebM and more</span><span class="dot">·</span><span>Processed locally</span></div>
        </div>
      </div>
      <div id="editor" class="editor" hidden>
        <div class="file-heading"><div class="file-icon">▶</div><div class="file-text"><strong id="file-name"></strong><span id="file-details"></span></div><button id="replace-button" class="icon-button" aria-label="Choose another video" title="Choose another video">↻</button></div>
        <div class="editor-grid"><div class="preview-wrap"><video id="preview" muted playsinline controls preload="metadata"></video><span class="preview-label">LOCAL PREVIEW</span></div>
          <div class="settings">
            <div class="target-row"><span>Target file size</span><strong><i></i> 19.8 MB</strong></div>
            <label class="field-label" for="resolution">Output resolution</label><select id="resolution" class="select"><option value="original">Original resolution</option><option value="1080">Up to 1080p</option><option value="720">Up to 720p</option><option value="360">Up to 360p</option></select>
            <label class="audio-choice"><span><strong>Keep audio</strong><small id="audio-note">Include the original audio track</small></span><input id="audio-toggle" type="checkbox" checked /><span class="switch" aria-hidden="true"></span></label>
            <div id="estimate" class="estimate"></div>
            <div id="warning" class="warning" hidden></div>
            <div id="actions" class="actions"><button id="compress-button" class="button button-primary wide" type="button">Compress video <span aria-hidden="true">→</span></button><button id="original-button" class="button button-quiet wide" type="button" hidden>Download original</button><p class="safe-note"><span>✓</span> Your video never leaves your device</p></div>
          </div>
        </div>
        <div id="progress-panel" class="progress-panel" hidden aria-live="polite"><div class="progress-top"><div><span class="eyebrow">COMPRESSION IN PROGRESS</span><h3 id="progress-title">Preparing encoder</h3></div><button id="cancel-button" class="button button-quiet" type="button">Cancel</button></div><div class="progress-track"><div id="progress-bar"></div></div><div class="progress-meta"><span id="progress-caption">Preparing video…</span><strong id="progress-percent">0%</strong></div><div id="pass-note" class="pass-note"></div></div>
        <div id="result-panel" class="result-panel" hidden><div class="result-check">✓</div><div class="result-copy"><h3>Ready to share</h3><p id="result-summary"></p></div><button id="download-button" class="button button-primary" type="button">Download MP4 <span aria-hidden="true">↓</span></button></div>
        <div id="error-panel" class="error-panel" hidden role="alert"><span>!</span><p id="error-message"></p><button id="retry-button" class="text-button" type="button">Try again</button></div>
      </div>
      <div class="card-foot"><span class="lock-icon">▣</span><span>100% local processing</span><span class="foot-divider">·</span><span>No upload. No account. No surprises.</span></div>
    </section>
    <footer class="page-footer"><span>Made for the clips worth keeping.</span><span class="footer-right"><span class="status-dot"></span> Works in Chrome &amp; Edge</span></footer>
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
  $('#compress-button').textContent = alreadyFits ? 'Compress anyway' : 'Compress video  →';
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
