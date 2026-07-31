const TOTAL = 10;
const list = document.getElementById('message-list');

// ナビゲーションボタンのクリック処理
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    showLesson(btn.dataset.lesson);
  });
});

function showLesson(lesson) {
  list.innerHTML = '';
  if (lesson === 'home') {
    showHome();
  } else {
    buildBlocks();
    loadAllTexts(lesson);
  }
}

function showHome() {
  const div = document.createElement('div');
  div.className = 'message-block';
  div.innerHTML = `
    <h2>このサイトの使い方</h2>
    <p style="line-height:1.8; margin-top:8px;">
      上部のメニューからレッスンを選択すると、そのレッスンのプロンプト・コード一覧が表示されます。<br>
      各項目の右下にある <strong>「コピー」</strong> ボタンを押すと、内容がクリップボードにコピーされます。<br>
      コピー済みのボタンは <strong>「コピーしました！」</strong> と表示され、どこまで進んだか確認できます。<br>
      ボタンを再度押すと、再びコピーが実行されます。
    </p>
  `;
  list.appendChild(div);
}

function buildBlocks() {
  for (let i = 1; i <= TOTAL; i++) {
    const num = String(i).padStart(2, '0');

    const block = document.createElement('div');
    block.className = 'message-block';

    const heading = document.createElement('h2');
    heading.id = `heading-${num}`;
    heading.textContent = '読み込み中...';

    const textarea = document.createElement('textarea');
    textarea.id = `textarea-${num}`;
    textarea.placeholder = '読み込み中...';

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    const icon = document.createElement('img');
    icon.src = 'copy.png';
    icon.alt = '';
    icon.className = 'copy-icon';

    const label = document.createElement('span');
    label.className = 'copy-label';
    label.textContent = 'コピー';

    btn.appendChild(icon);
    btn.appendChild(label);
    btn.addEventListener('click', () => copyText(textarea, btn));

    block.appendChild(heading);
    block.appendChild(textarea);
    block.appendChild(btn);
    list.appendChild(block);
  }
}

function loadAllTexts(lesson) {
  for (let i = 1; i <= TOTAL; i++) {
    const num = String(i).padStart(2, '0');
    const textarea = document.getElementById(`textarea-${num}`);
    const heading = document.getElementById(`heading-${num}`);
    const files = [
      { path: `${lesson}/${num}prompt.txt`, label: `プロンプト ${i}` },
      { path: `${lesson}/${num}code.txt`, label: `コード ${i}` },
      { path: `${lesson}/msg${num}.txt`, label: `プロンプト ${i}` }
    ];
    textarea.placeholder = '読み込み中...';

    loadTextFile(files)
      .then(({ text, label }) => {
        heading.textContent = label;
        textarea.value = text;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      })
      .catch(() => {
        heading.textContent = `項目 ${i}`;
        textarea.value = '';
        textarea.placeholder = `（${files.map(file => file.path).join(' または ')} を読み込めませんでした）`;
      });
  }
}

function loadTextFile(files) {
  const [file, ...remainingFiles] = files;

  return fetch(file.path, { cache: 'no-store' })
    .then(res => {
      if (!res.ok) throw new Error(`${file.path} が見つかりません`);
      return res.text();
    })
    .then(text => ({ text, label: file.label }))
    .catch(() => {
      if (remainingFiles.length === 0) throw new Error('ファイルが見つかりません');
      return loadTextFile(remainingFiles);
    });
}

function copyText(textarea, btn) {
  const text = textarea.value;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    setCopyButtonLabel(btn, 'コピーしました！');
    btn.classList.add('copied');
  }).catch(() => {
    // Clipboard API が使えない場合のフォールバック
    textarea.select();
    document.execCommand('copy');
    setCopyButtonLabel(btn, 'コピーしました！');
    btn.classList.add('copied');
  });
}

function setCopyButtonLabel(btn, text) {
  const label = btn.querySelector('.copy-label');
  if (label) {
    label.textContent = text;
    return;
  }
  btn.textContent = text;
}

// 起動時は「はじめに」を表示
showLesson('home');
