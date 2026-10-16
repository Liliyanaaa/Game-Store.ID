const SUPABASE_URL = "https://bzpziuudmwiesszmsmbw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MCXmqcDItpvHnWthYI824w_lFASKKZW";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let games = [];
let selectedGame = null;
let selectedPackage = null;

async function loadGames(){
  const { data, error } = await db.from('games').select('*').order('id');
  if(error){ console.error(error); return; }
  games = data.map(g => ({
    name: g.name,
    publisher: g.publisher,
    icon: g.icon_url,
    category: g.category,
    packages: g.packages
  }));
  renderGames(games);
}

function renderGames(list){
  const grid = document.getElementById('gamesGrid');
  grid.innerHTML = "";
  list.forEach(g=>{
    const card = document.createElement('div');
    card.className = "game-card";
    card.onclick = ()=> openCheckout(g);
    card.innerHTML = `<img src="${g.icon}" onerror="this.src='https://via.placeholder.com/300x300/111/fff?text='+encodeURIComponent(g.name)">
    <div class="info"><h3>${g.name}</h3><p>${g.publisher} - ${g.category}</p><div class="price">Mulai Rp ${g.packages[0].price.toLocaleString('id-ID')}</div></div>`;
    grid.appendChild(card);
  });
}

function filterGame(cat){
  document.querySelectorAll('#filter button').forEach(b=>b.classList.remove('active'));
  event.target.classList.add('active');
  if(cat==='all') renderGames(games);
  else renderGames(games.filter(g=> g.category === cat));
}

document.getElementById('search').addEventListener('input', (e)=>{
  const q = e.target.value.toLowerCase();
  renderGames(games.filter(g=> g.name.toLowerCase().includes(q)));
});

function openCheckout(game){
  selectedGame = game;
  selectedPackage = game.packages[0];
  document.getElementById('modalGameName').innerText = game.name;
  document.getElementById('modalGameImg').src = game.icon;
  const pl = document.getElementById('packageList');
  pl.innerHTML = "";
  game.packages.forEach(p=>{
    const div = document.createElement('div');
    div.className = "package";
    div.innerHTML = `<span>${p.label}</span><b>Rp ${p.price.toLocaleString('id-ID')}</b>`;
    div.onclick = ()=>{ selectedPackage = p; document.querySelectorAll('.package').forEach(x=>x.style.borderColor="#333"); div.style.borderColor="#fff"; };
    pl.appendChild(div);
  });
  document.getElementById('checkoutModal').classList.add('active');
}

function closeModal(){ document.getElementById('checkoutModal').classList.remove('active'); }

async function processOrder(){
  const userId = document.getElementById('userId').value.trim();
  if(!userId){ alert("Isi User ID dulu!"); return; }
  const pay = document.getElementById('payMethod').value;
  const { error } = await db.from('orders').insert([{
    game: selectedGame.name,
    user_id_game: userId,
    paket: selectedPackage.label,
    harga: selectedPackage.price,
    payment: pay,
    status: 'pending'
  }]);
  if(error){ alert("Gagal: "+error.message); return; }
  alert(`Order berhasil!\nGame: ${selectedGame.name}\nPaket: ${selectedPackage.label}\nBayar via: ${pay}\nUser ID: ${userId}`);
  closeModal();
}

loadGames();