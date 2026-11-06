/*  ░██████╗░██████╗░██╗░░░░░░░░██╗░██████╗░░░░█████╗░██████╗░░██████╗░
    ██╔════╝░██╔══██╗██║░░░░░░░░██║██╔════╝░░░██╔══██╗██╔══██╗██╔════╝░
    ██║░░██╗░██║░░██║██║░░░░░░░░██║╚█████╗░░░░██║░░██║██████╔╝██║░░██╗░
    ██║░░╚██╗██║░░██║██║░░░██╗░░██║░╚═══██╗░░░██║░░██║██╔══██╗██║░░╚██╗
    ╚██████╔╝██████╔╝██║██╗╚█████╔╝██████╔╝██╗╚█████╔╝██║░░██║╚██████╔╝
    ░╚═════╝░╚═════╝░╚═╝╚═╝░╚════╝░╚═════╝░╚═╝░╚════╝░╚═╝░░╚═╝░╚═════╝░
                             v 2.2.3
A Script Redesigned by Parveen Bhadoo from GOIndex at https://gitlab.com/GoogleDriveIndex/Google-Drive-Index */

// WARNING WARNING WARNING
// This Script doesn't fully support Folder ID (search won't work), use root or Shared Drive ID only

// add multiple serviceaccounts as {}, {}, {}, random account will be selected by each time app is opened.
const serviceaccounts = [
{}
];
const randomserviceaccount = serviceaccounts[Math.floor(Math.random()*serviceaccounts.length)]; // DO NOT TOUCH THIS
const domains_for_dl = ['']; // add multiple cloudflare addresses to balance the load on download/stream servers, eg. ['https://testing.fetchgoogleapi.workers.dev', 'https://testing2.fetchgoogleapi2.workers.dev']
const domain_for_dl = domains_for_dl[Math.floor(Math.random()*domains_for_dl.length)]; // DO NOT TOUCH THIS
const video_domains_for_dl = ['']; // add multiple cloudflare addresses to balance the load on download/stream servers, eg. ['https://testing.fetchgoogleapi.workers.dev', 'https://testing2.fetchgoogleapi2.workers.dev']
const video_domain_for_dl = video_domains_for_dl[Math.floor(Math.random()*video_domains_for_dl.length)]; // DO NOT TOUCH THIS
const blocked_region = []; // add regional codes seperated by comma, eg. ['IN', 'US', 'PK']
const blocked_asn = []; // add ASN numbers from http://www.bgplookingglass.com/list-of-autonomous-system-numbers, eg. [16509, 12345]
// Bindings and secrets arrive through the module worker's env object (see export default at the bottom).
let __env = {};
const ENV = (name, fallback = '') => (__env && typeof __env[name] !== 'undefined' ? __env[name] : fallback);
const authConfig = {
    "siteName": "My Drive", // Website name
    "client_id": "", // Client id from Google Cloud Console
    "client_secret": "", // Client Secret from Google Cloud Console
    "refresh_token": "", // Authorize token
    "service_account": false, // true if you're using Service Account instead of user account
    "service_account_json": randomserviceaccount, // don't touch this one
    "files_list_page_size": 50,
    "search_result_list_page_size": 50,
    "enable_cors_file_down": false,
    "enable_password_file_verify": true, // support for .password file
    "direct_link_protection": false, // protects direct links with Display UI
    "lock_folders": false, // keeps folders and search locked if auth in on, and allows individual file view
    "enable_auth0_com": false, // follow guide to add auth0.com to secure index with powerful login based system
    "roots":[
      {
          "id": "root",
          "name": "Drive One",
          "protect_file_link": false,
          //"auth": {"patwary":"student"} /* Remove double slash before "auth" to activate id password protection */
      },
    ]};

    const auth0 = {
          domain: "", // Tenent Domain from auth0.com website
          clientId: "", // App Client ID from auth0.com website
          clientSecret: "", // App Client Secret from auth0.com website
          callbackUrl: "", // your domain with /auth at the end. eg. https://example.com/auth, add this in auth0.com too
          logoutUrl: "", // your domain logout page eg. https://example.com, add this in auth0.com too
    }

/*
███████╗██████╗░██╗████████╗  ████████╗██╗░░██╗███████╗░██████╗███████╗
██╔════╝██╔══██╗██║╚══██╔══╝  ╚══██╔══╝██║░░██║██╔════╝██╔════╝██╔════╝
█████╗░░██║░░██║██║░░░██║░░░  ░░░██║░░░███████║█████╗░░╚█████╗░█████╗░░
██╔══╝░░██║░░██║██║░░░██║░░░  ░░░██║░░░██╔══██║██╔══╝░░░╚═══██╗██╔══╝░░
███████╗██████╔╝██║░░░██║░░░  ░░░██║░░░██║░░██║███████╗██████╔╝███████╗
╚══════╝╚═════╝░╚═╝░░░╚═╝░░░  ░░░╚═╝░░░╚═╝░░╚═╝╚══════╝╚═════╝░╚══════╝

██╗░░░██╗░█████╗░██╗░░░░░██╗░░░██╗███████╗░██████╗
██║░░░██║██╔══██╗██║░░░░░██║░░░██║██╔════╝██╔════╝
╚██╗░██╔╝███████║██║░░░░░██║░░░██║█████╗░░╚█████╗░
░╚████╔╝░██╔══██║██║░░░░░██║░░░██║██╔══╝░░░╚═══██╗
░░╚██╔╝░░██║░░██║███████╗╚██████╔╝███████╗██████╔╝
░░░╚═╝░░░╚═╝░░╚═╝╚══════╝░╚═════╝░╚══════╝╚═════╝░*/

const uiConfig = {
    "theme": "slate", // switch between themes, default set to slate, select from https://gitlab.com/GoogleDriveIndex/Google-Drive-Index
    "version": "2.2.3", // don't touch this one. get latest code using generator at https://bdi-generator.hashhackers.com
    // If you're using Image then set to true, If you want text then set it to false
    "logo_image": false, // true if you're using image link in next option.
    "logo_height": "", // only if logo_image is true
    "logo_width": "100px", // only if logo_image is true
    "favicon": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='9' fill='%238b7bff'/%3E%3C/svg%3E",
    // if logo is true then link otherwise just text for name
    "logo_link_name": "",
    "fixed_header": true, // If you want the footer to be flexible or fixed.
    "header_padding": "80", // Value 80 for fixed header, Value 20 for flexible header. Required to be changed accordingly in some themes.
    "nav_link_1": "Home", // change navigation link name
    "nav_link_3": "Current Path", // change navigation link name
    "nav_link_4": "Contact", // change navigation link name
    "show_logout_button": false, // shows logout button if auth0.com is active
    "fixed_footer": false, // If you want the footer to be flexible or fixed.
    "hide_footer": true, // hides the footer from site entirely.
    "header_style_class": "navbar-dark bg-primary", // navbar-dark bg-primary || navbar-dark bg-dark || navbar-light bg-light
    "footer_style_class": "bg-primary", // bg-primary || bg-dark || bg-light
    "css_a_tag_color": "white", // Color Name or Hex Code eg. #ffffff
    "css_p_tag_color": "white", // Color Name or Hex Code eg. #ffffff
    "folder_text_color": "white", // Color Name or Hex Code eg. #ffffff
    "loading_spinner_class": "text-light", // https://getbootstrap.com/docs/5.0/components/spinners/#colors
    "search_button_class": "btn btn-danger", // https://getbootstrap.com/docs/5.0/components/buttons/#examples
    "path_nav_alert_class": "alert alert-primary", // https://getbootstrap.com/docs/4.0/components/alerts/#examples
    "file_view_alert_class": "alert alert-danger", // https://getbootstrap.com/docs/4.0/components/alerts/#examples
    "file_count_alert_class": "alert alert-secondary", // https://getbootstrap.com/docs/4.0/components/alerts/#examples
    "contact_link": "", // Link to Contact Button on Menu
    "copyright_year": "2050", // year of copyright, can be anything like 2015 - 2020 or just 2020
    "company_name": "Bhadoo Cloud", // Name next to copyright
    "company_link": "https://telegram.dog/Telegram", // link of copyright name
    "credit": true, // Set this to true to give us credit
    "display_size": true, // Set this to false to hide display file size
    "display_time": false, // Set this to false to hide display modified time for folder and files
    "display_download": true, // Set this to false to hide download icon for folder and files on main index
    "disable_player": false, // Set this to true to hide audio and video players
    "custom_srt_lang": "", // Subtitle Language Code for Custom .vtt language.
    "disable_video_download": false, // Remove Download, Copy Button on Videos
    "second_domain_for_dl": false, // If you want to display other URL for Downloading to protect your main domain.
    "downloaddomain": domain_for_dl, // Ignore this and set domains at top of this page after service accounts.
    "videodomain": video_domain_for_dl, // Ignore this and set domains at top of this page after service accounts.
    "poster": "https://cdn.jsdelivr.net/npm/@googledrive/index@2.2.3/images/poster.jpg", // Video poster URL or see Readme to how to load from Drive
    "audioposter": "https://cdn.jsdelivr.net/npm/@googledrive/index@2.2.3/images/music.jpg", // Video poster URL or see Readme to how to load from Drive
    "jsdelivr_cdn_src": "https://cdn.jsdelivr.net/npm/@googledrive/index", // If Project is Forked, then enter your GitHub repo
    "render_head_md": true, // Render Head.md
    "render_readme_md": true, // Render Readme.md
    "display_drive_link": false, // This will add a Link Button to Google Drive of that particular file.
    "plyr_io_version": "3.7.2", // Change plyr.io version in future when needed.
    "plyr_io_video_resolution": "16:9", // For reference, visit: https://github.com/sampotts/plyr#options
    "unauthorized_owner_link": "https://telegram.dog/Telegram", // Unauthorized Error Page Link to Owner
    "unauthorized_owner_email": "abuse@telegram.org", // Unauthorized Error Page Owner Email
    "convert_search_to_google_drive_app": false // gives gdrive links on search and searches all drives on that account, doesn't require adding
};


/*
██████╗░░█████╗░  ███╗░░██╗░█████╗░████████╗  ███████╗██████╗░██╗████████╗
██╔══██╗██╔══██╗  ████╗░██║██╔══██╗╚══██╔══╝  ██╔════╝██╔══██╗██║╚══██╔══╝
██║░░██║██║░░██║  ██╔██╗██║██║░░██║░░░██║░░░  █████╗░░██║░░██║██║░░░██║░░░
██║░░██║██║░░██║  ██║╚████║██║░░██║░░░██║░░░  ██╔══╝░░██║░░██║██║░░░██║░░░
██████╔╝╚█████╔╝  ██║░╚███║╚█████╔╝░░░██║░░░  ███████╗██████╔╝██║░░░██║░░░
╚═════╝░░╚════╝░  ╚═╝░░╚══╝░╚════╝░░░░╚═╝░░░  ╚══════╝╚═════╝░╚═╝░░░╚═╝░░░

██████╗░███████╗██╗░░░░░░█████╗░░██╗░░░░░░░██╗
██╔══██╗██╔════╝██║░░░░░██╔══██╗░██║░░██╗░░██║
██████╦╝█████╗░░██║░░░░░██║░░██║░╚██╗████╗██╔╝
██╔══██╗██╔══╝░░██║░░░░░██║░░██║░░████╔═████║░
██████╦╝███████╗███████╗╚█████╔╝░░╚██╔╝░╚██╔╝░
╚═════╝░╚══════╝╚══════╝░╚════╝░░░░╚═╝░░░╚═╝░░*/

// DON'T TOUCH BELOW THIS UNLESS YOU KNOW WHAT YOU'RE DOING
var gds = [];

/* ---------- Custom front-end ("Aurora" UI) — replaces the stock app.obf.js bundle ---------- */
const appCSS = String.raw`
:root{color-scheme:dark;--bg:#070910;--bg2:#0d1020;--card:rgba(255,255,255,.045);--card-h:rgba(255,255,255,.085);--bd:rgba(255,255,255,.09);--tx:#eef1f8;--mu:#8b93a7;--ac:#8b7bff;--ac2:#22d3ee;--glow:rgba(139,123,255,.38);--sh:0 24px 70px -24px rgba(0,0,0,.7);--r:18px;--pill:rgba(255,255,255,.07);
--k-folder:#ffb84d;--k-video:#ff5f7e;--k-audio:#34d399;--k-image:#38bdf8;--k-archive:#fb923c;--k-doc:#a78bfa;--k-code:#22d3ee;--k-file:#94a3b8}
[data-theme=light]{color-scheme:light;--bg:#f2f4fb;--bg2:#fff;--card:rgba(255,255,255,.78);--card-h:#fff;--bd:rgba(20,24,50,.09);--tx:#12162b;--mu:#66708a;--ac:#6a55f5;--ac2:#0ea5c6;--glow:rgba(106,85,245,.22);--sh:0 24px 60px -26px rgba(30,40,90,.28);--pill:rgba(20,24,50,.06)}
*{box-sizing:border-box;margin:0}
[hidden]{display:none!important}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--tx);font:15px/1.5 Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh;overflow-x:hidden}
body::before,body::after{content:"";position:fixed;z-index:-1;width:60vmax;height:60vmax;border-radius:50%;filter:blur(90px);opacity:.5;pointer-events:none}
body::before{background:radial-gradient(circle,var(--ac),transparent 65%);top:-30vmax;left:-15vmax;animation:drift 22s ease-in-out infinite alternate}
body::after{background:radial-gradient(circle,var(--ac2),transparent 65%);bottom:-35vmax;right:-20vmax;animation:drift 28s ease-in-out infinite alternate-reverse;opacity:.35}
[data-theme=light] body::before,[data-theme=light] body::after{opacity:.22}
@keyframes drift{to{transform:translate(8vmax,6vmax) scale(1.15)}}
@keyframes rise{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}
@keyframes shimmer{to{background-position:-200% 0}}
@keyframes shake{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
@keyframes bar{0%,100%{height:8px}50%{height:34px}}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit;cursor:pointer;background:none;border:0}
svg.i{width:1.25em;height:1.25em;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}
kbd{font:500 11px "JetBrains Mono",monospace;padding:2px 6px;border-radius:6px;background:var(--pill);border:1px solid var(--bd);color:var(--mu)}
::-webkit-scrollbar{width:10px;height:10px}::-webkit-scrollbar-thumb{background:var(--bd);border-radius:10px}

.top{position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:14px;padding:12px clamp(14px,4vw,36px);backdrop-filter:blur(18px) saturate(170%);-webkit-backdrop-filter:blur(18px) saturate(170%);background:color-mix(in srgb,var(--bg) 65%,transparent);border-bottom:1px solid var(--bd)}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;letter-spacing:-.01em;font-size:17px}
.brand .logo{background:rgba(255,255,255,.92);border-radius:12px;padding:6px 10px;display:flex;box-shadow:0 4px 18px -6px rgba(0,0,0,.5)}
.brand img{height:26px;width:auto;max-width:130px;display:block}
.brand .dot{width:30px;height:30px;border-radius:10px;background:linear-gradient(135deg,var(--ac),var(--ac2));display:grid;place-items:center;color:#fff}
.sbtn{flex:1;max-width:520px;margin:0 auto;display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:14px;background:var(--card);border:1px solid var(--bd);color:var(--mu);transition:.2s}
.sbtn:hover{border-color:var(--ac);box-shadow:0 0 0 4px var(--glow);color:var(--tx)}
.sbtn span{flex:1;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ibtn{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--card);border:1px solid var(--bd);color:var(--mu);transition:.2s}
.ibtn:hover{color:var(--tx);border-color:var(--ac);transform:translateY(-1px)}

.wrap{max-width:1180px;margin:0 auto;padding:clamp(16px,3vw,32px) clamp(14px,4vw,36px) 80px}
.crumbs{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-bottom:18px}
.crumbs a,.crumbs b{padding:6px 12px;border-radius:999px;background:var(--pill);font-size:13px;font-weight:500;color:var(--mu);transition:.15s;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.crumbs a:hover{color:var(--tx);background:var(--card-h)}
.crumbs b{color:var(--tx);background:linear-gradient(135deg,color-mix(in srgb,var(--ac) 30%,transparent),color-mix(in srgb,var(--ac2) 22%,transparent));border:1px solid var(--bd)}
.crumbs .sep{color:var(--mu);opacity:.5;font-size:12px}
.head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:18px}
.head h1{font-size:clamp(24px,4vw,36px);letter-spacing:-.03em;line-height:1.1;font-weight:700;word-break:break-word}
.stats{display:flex;gap:8px;flex-wrap:wrap}
.stat{padding:5px 12px;border-radius:999px;background:var(--card);border:1px solid var(--bd);font-size:12.5px;color:var(--mu)}
.stat b{color:var(--tx);font-weight:600}
.bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:16px}
.chips{display:flex;gap:6px;flex-wrap:wrap;flex:1;min-width:200px}
.chip{padding:7px 13px;border-radius:999px;font-size:13px;font-weight:500;background:var(--card);border:1px solid var(--bd);color:var(--mu);transition:.15s;display:flex;gap:6px;align-items:center}
.chip:hover{color:var(--tx)}
.chip.on{background:linear-gradient(135deg,var(--ac),var(--ac2));color:#fff;border-color:transparent;box-shadow:0 8px 20px -8px var(--glow)}
.chip em{font-style:normal;opacity:.7;font-size:11.5px}
.ctl{display:flex;gap:8px;align-items:center}
.field{display:flex;align-items:center;gap:8px;padding:0 12px;height:40px;border-radius:12px;background:var(--card);border:1px solid var(--bd);color:var(--mu)}
.field:focus-within{border-color:var(--ac);box-shadow:0 0 0 3px var(--glow)}
.field input,.field select{background:none;border:0;outline:0;color:var(--tx);font:inherit;width:140px}
.field select{width:auto;cursor:pointer}.field select option{background:var(--bg2);color:var(--tx)}
.seg{display:flex;padding:3px;border-radius:12px;background:var(--card);border:1px solid var(--bd)}
.seg button{width:34px;height:32px;display:grid;place-items:center;border-radius:9px;color:var(--mu)}
.seg button.on{background:var(--pill);color:var(--tx)}

.list{display:flex;flex-direction:column;gap:8px}
.item{--c:var(--k-file);position:relative;display:grid;grid-template-columns:auto 1fr 90px 130px auto;align-items:center;gap:14px;padding:10px 14px 10px 10px;border-radius:16px;background:var(--card);border:1px solid var(--bd);cursor:pointer;overflow:hidden;transition:transform .18s,border-color .18s,background .18s,box-shadow .18s;animation:rise .45s both;animation-delay:calc(min(var(--n),14)*22ms)}
.item::before{content:"";position:absolute;inset:0;background:radial-gradient(280px circle at var(--mx,50%) var(--my,50%),var(--glow),transparent 62%);opacity:0;transition:opacity .25s;pointer-events:none}
.item:hover{border-color:color-mix(in srgb,var(--c) 55%,var(--bd));background:var(--card-h);transform:translateY(-2px);box-shadow:var(--sh)}
.item:hover::before{opacity:.6}
.thumb{position:relative;z-index:1}
.tile{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;background:color-mix(in srgb,var(--c) 17%,transparent);color:var(--c);transition:transform .2s}
.item:hover .tile{transform:rotate(-6deg) scale(1.06)}
.tile svg.i{width:23px;height:23px}
.thumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;opacity:0;transition:opacity .4s}
.thumb img.ok{opacity:1}
.info{min-width:0;position:relative;z-index:1}
.name{display:block;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub{display:none;font-size:12.5px;color:var(--mu);margin-top:2px}
.col{font-size:13px;color:var(--mu);position:relative;z-index:1;text-align:right;white-space:nowrap}
.acts{display:flex;gap:4px;position:relative;z-index:1;opacity:0;transform:translateX(6px);transition:.2s}
.item:hover .acts,.item:focus-within .acts{opacity:1;transform:none}
.acts button,.acts a{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;color:var(--mu);transition:.15s}
.acts button:hover,.acts a:hover{background:var(--pill);color:var(--tx)}
.list.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}
.grid .item{display:flex;flex-direction:column;align-items:stretch;gap:0;padding:0}
.grid .thumb{height:132px}
.grid .tile{width:100%;height:100%;border-radius:0;background:linear-gradient(150deg,color-mix(in srgb,var(--c) 24%,transparent),color-mix(in srgb,var(--c) 6%,transparent))}
.grid .tile svg.i{width:44px;height:44px}
.grid .thumb img{border-radius:0}
.grid .info{padding:12px 14px 14px}
.grid .sub{display:block}.grid .col{display:none}
.grid .acts{position:absolute;top:8px;right:8px;background:color-mix(in srgb,var(--bg) 70%,transparent);backdrop-filter:blur(8px);border-radius:12px;padding:2px}
.list.compact{gap:2px}
.compact .item{padding:4px 10px 4px 6px;border-radius:10px;background:transparent;border-color:transparent;grid-template-columns:auto 1fr 90px 130px auto}
.compact .tile{width:30px;height:30px;border-radius:9px;background:none}.compact .tile svg.i{width:18px;height:18px}
.compact .item:hover{background:var(--card-h)}
.more{height:1px}
.skel{height:66px;border-radius:16px;background:linear-gradient(90deg,var(--card) 25%,var(--card-h) 50%,var(--card) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border:1px solid var(--bd)}
.state{text-align:center;padding:70px 20px;color:var(--mu)}
.state .big{width:86px;height:86px;border-radius:28px;margin:0 auto 18px;display:grid;place-items:center;background:var(--card);border:1px solid var(--bd);color:var(--ac)}
.state .big svg.i{width:38px;height:38px}
.state h3{color:var(--tx);font-size:20px;margin-bottom:6px}
.gate{max-width:380px;margin:40px auto;display:flex;flex-direction:column;gap:12px}
.gate input{height:46px;border-radius:14px;padding:0 16px;background:var(--card);border:1px solid var(--bd);color:var(--tx);font:inherit;outline:0;text-align:center}
.gate input:focus{border-color:var(--ac);box-shadow:0 0 0 3px var(--glow)}
.gate.bad input{animation:shake .4s;border-color:#ff5f7e}
.btn{height:44px;padding:0 20px;border-radius:14px;font-weight:600;background:linear-gradient(135deg,var(--ac),var(--ac2));color:#fff;display:inline-flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 12px 26px -12px var(--glow);transition:.2s}
.btn:hover{transform:translateY(-2px)}
.btn.ghost{background:var(--card);color:var(--tx);border:1px solid var(--bd);box-shadow:none}

.hero{padding:clamp(30px,8vw,80px) 0 20px;text-align:center}
.eyebrow{display:inline-block;padding:5px 14px;border-radius:999px;background:var(--card);border:1px solid var(--bd);font-size:12.5px;color:var(--mu);margin-bottom:18px}
.hero h1{font-size:clamp(38px,8vw,76px);letter-spacing:-.045em;line-height:1;font-weight:800;background:linear-gradient(120deg,var(--tx) 20%,var(--ac) 60%,var(--ac2));-webkit-background-clip:text;background-clip:text;color:transparent}
.lead{margin:16px auto 26px;max-width:460px;color:var(--mu);font-size:17px}
.hero-search{display:inline-flex;align-items:center;gap:12px;padding:15px 20px;min-width:min(440px,90vw);border-radius:18px;background:var(--card);border:1px solid var(--bd);color:var(--mu);transition:.2s}
.hero-search:hover{border-color:var(--ac);box-shadow:0 0 0 5px var(--glow)}
.hero-search span{flex:1;text-align:left}
.drives{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;margin-top:20px}
.drive{--c:var(--ac);position:relative;overflow:hidden;display:flex;flex-direction:column;gap:46px;padding:22px;border-radius:22px;background:var(--card);border:1px solid var(--bd);transition:.25s;animation:rise .5s both;animation-delay:calc(var(--n)*70ms)}
.drive:hover{transform:translateY(-4px);border-color:var(--ac);box-shadow:var(--sh)}
.drive::after{content:"";position:absolute;right:-40px;top:-40px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,var(--glow),transparent 70%)}
.drive .tile{width:54px;height:54px;border-radius:16px}
.drive b{font-size:18px;font-weight:600;display:block}.drive small{color:var(--mu)}
.md{margin-top:34px;padding:clamp(18px,3vw,30px);border-radius:22px;background:var(--card);border:1px solid var(--bd);line-height:1.7;overflow-x:auto}
.md h1,.md h2,.md h3{margin:1.1em 0 .4em;letter-spacing:-.02em}.md a{color:var(--ac2);text-decoration:underline}.md img{max-width:100%;border-radius:12px}
.md code{font-family:"JetBrains Mono",monospace;background:var(--pill);padding:2px 6px;border-radius:6px;font-size:.9em}.md pre{background:var(--pill);padding:14px;border-radius:12px;overflow:auto}.md pre code{background:none;padding:0}
.md ul,.md ol{padding-left:1.4em}.md table{border-collapse:collapse}.md td,.md th{border:1px solid var(--bd);padding:6px 12px}

.ov{position:fixed;inset:0;z-index:100;display:none;background:color-mix(in srgb,var(--bg) 72%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
.ov.show{display:flex;animation:rise .25s both}
#pal{align-items:flex-start;justify-content:center;padding:12vh 14px 0}
.pal{width:min(640px,100%);border-radius:22px;background:var(--bg2);border:1px solid var(--bd);box-shadow:var(--sh);overflow:hidden}
.pal-in{display:flex;align-items:center;gap:12px;padding:0 18px;height:60px;border-bottom:1px solid var(--bd);color:var(--mu)}
.pal-in input{flex:1;background:none;border:0;outline:0;color:var(--tx);font:inherit;font-size:17px}
.pal-res{max-height:52vh;overflow:auto;padding:8px}
.pal-res .r{--c:var(--k-file);display:flex;gap:12px;align-items:center;padding:9px 10px;border-radius:12px;cursor:pointer}
.pal-res .r.sel,.pal-res .r:hover{background:var(--pill)}
.pal-res .tile{width:36px;height:36px;border-radius:11px}.pal-res .tile svg.i{width:18px;height:18px}
.pal-res .r div{min-width:0;flex:1}.pal-res .r small{color:var(--mu);display:block}
.pal-res .r span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
.pal-ft{display:flex;gap:14px;padding:10px 16px;border-top:1px solid var(--bd);font-size:12px;color:var(--mu);justify-content:space-between}
.pal-msg{padding:34px;text-align:center;color:var(--mu)}
#pv{flex-direction:column;background:color-mix(in srgb,var(--bg) 88%,transparent)}
.pv-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px clamp(12px,3vw,28px);border-bottom:1px solid var(--bd)}
.pv-title{display:flex;align-items:center;gap:12px;min-width:0}.pv-title .tile{width:40px;height:40px}
.pv-title b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600}.pv-title small{color:var(--mu)}.pv-title div{min-width:0}
.pv-act{display:flex;gap:6px;align-items:center}
.pv-body{flex:1;min-height:0;display:grid;place-items:center;padding:clamp(10px,3vw,30px);overflow:auto}
.pv-body img,.pv-body video{max-width:100%;max-height:100%;border-radius:14px;box-shadow:var(--sh);background:#000}
.pv-body video{width:min(1100px,100%)}
.pv-body iframe{width:min(1000px,100%);height:100%;border:0;border-radius:14px;background:#fff}
.pv-body pre{width:min(1000px,100%);max-height:100%;overflow:auto;padding:20px;border-radius:14px;background:var(--card);border:1px solid var(--bd);font:13px/1.6 "JetBrains Mono",monospace;white-space:pre-wrap;word-break:break-word;align-self:start}
.pv-body .md{width:min(900px,100%);margin:0;align-self:start}
.nofile{text-align:center;color:var(--mu)}.nofile .tile{width:110px;height:110px;border-radius:34px;margin:0 auto 20px}.nofile .tile svg.i{width:48px;height:48px}.nofile h3{color:var(--tx);margin-bottom:4px}.nofile .btn{margin-top:22px}
.audio{--c:var(--k-audio);text-align:center;width:min(440px,100%)}
.disc{width:190px;height:190px;border-radius:50%;margin:0 auto 22px;display:grid;place-items:center;background:conic-gradient(from 0deg,var(--ac),var(--ac2),var(--ac));box-shadow:0 20px 60px -15px var(--glow);color:#fff}
.disc svg.i{width:60px;height:60px}.audio.play .disc{animation:spin 6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.bars{display:flex;gap:5px;height:36px;align-items:center;justify-content:center;margin-bottom:18px}
.bars i{width:5px;height:8px;border-radius:4px;background:linear-gradient(var(--ac2),var(--ac))}
.audio.play .bars i{animation:bar .9s ease-in-out infinite}.bars i:nth-child(2){animation-delay:.15s!important}.bars i:nth-child(3){animation-delay:.3s!important}.bars i:nth-child(4){animation-delay:.45s!important}.bars i:nth-child(5){animation-delay:.6s!important}
.audio audio{width:100%}
.pv-nav{position:absolute;top:50%;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;background:var(--card);border:1px solid var(--bd);backdrop-filter:blur(8px);display:grid;place-items:center;z-index:2}
.pv-nav:hover{background:var(--card-h)}.pv-nav.l{left:14px}.pv-nav.r{right:14px}
#toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,30px);opacity:0;padding:11px 18px;border-radius:14px;background:var(--bg2);border:1px solid var(--bd);box-shadow:var(--sh);z-index:200;transition:.3s;pointer-events:none;font-size:14px}
#toast.show{opacity:1;transform:translate(-50%,0)}
.home{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:20px}
.hh{grid-column:1/-1;position:relative;padding:clamp(18px,4vw,46px) 0 12px;overflow:visible}
.hh .eyebrow{margin-bottom:14px}
.hh h1{font-size:clamp(40px,7.4vw,84px);letter-spacing:-.05em;line-height:.98;font-weight:800}
.hh .hello{color:var(--mu);font-weight:600;font-size:.52em;letter-spacing:-.03em}
.hh .grad{background:linear-gradient(110deg,var(--tx) 5%,var(--ac) 45%,var(--ac2) 85%);-webkit-background-clip:text;background-clip:text;color:transparent;background-size:200% 100%;animation:sheen 8s ease-in-out infinite alternate}
@keyframes sheen{to{background-position:100% 0}}
.hh .lead{margin:16px 0 24px;max-width:560px;color:var(--mu);font-size:clamp(15px,2vw,18px);text-align:left}
.hh .lead b{color:var(--tx);font-variant-numeric:tabular-nums}
.hh-act{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.hh .hero-search{min-width:min(420px,100%)}
.orb{position:absolute;border-radius:50%;filter:blur(40px);pointer-events:none;z-index:-1}
.orb.o1{width:260px;height:260px;right:6%;top:-10px;background:radial-gradient(circle,var(--ac),transparent 70%);opacity:.45;animation:bob 9s ease-in-out infinite alternate}
.orb.o2{width:200px;height:200px;right:22%;top:90px;background:radial-gradient(circle,var(--ac2),transparent 70%);opacity:.35;animation:bob 12s ease-in-out infinite alternate-reverse}
@keyframes bob{to{transform:translate(-30px,24px) scale(1.12)}}
.b{position:relative;background:var(--card);border:1px solid var(--bd);border-radius:26px;padding:22px;overflow:hidden;animation:rise .55s both;transition:border-color .2s}
.b:hover{border-color:color-mix(in srgb,var(--ac) 35%,var(--bd))}
.b-folders{grid-column:span 8}.b-snap{grid-column:span 4}.b-3{grid-column:span 4}.b-wide{grid-column:1/-1}
.bt{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:16px}
.bt h3{font-size:15px;letter-spacing:-.01em;font-weight:700}.bs{font-size:12.5px;color:var(--mu)}
.fgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
.fcard{position:relative;display:flex;flex-direction:column;gap:3px;padding:16px;border-radius:20px;min-height:128px;justify-content:flex-end;overflow:hidden;background:linear-gradient(150deg,color-mix(in srgb,var(--g1) 30%,transparent),color-mix(in srgb,var(--g2) 10%,transparent));border:1px solid color-mix(in srgb,var(--g1) 30%,var(--bd));transition:transform .22s,box-shadow .22s;animation:rise .5s both;animation-delay:calc(var(--n)*60ms)}
.fcard::before{content:"";position:absolute;right:-30px;top:-30px;width:110px;height:110px;border-radius:50%;background:radial-gradient(circle,var(--g1),transparent 70%);opacity:.5;transition:transform .4s}
.fcard:hover{transform:translateY(-5px) rotate(-.6deg);box-shadow:0 22px 40px -20px var(--g1)}.fcard:hover::before{transform:scale(1.5)}
.fic{position:absolute;left:16px;top:16px;width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(135deg,var(--g1),var(--g2));color:#fff;box-shadow:0 10px 20px -8px var(--g1)}
.fic svg.i{width:22px;height:22px}
.fcard b{font-size:16px;letter-spacing:-.01em;position:relative;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fcard small{color:var(--mu);font-size:12.5px;display:inline-flex;align-items:center;gap:4px;position:relative}.fcard small svg.i{width:13px;height:13px;transition:transform .2s}.fcard:hover small svg.i{transform:translateX(4px)}
.big-n{font-size:clamp(32px,4vw,44px);font-weight:800;letter-spacing:-.04em;line-height:1.05}
.mu{color:var(--mu);font-size:13px;margin:2px 0 16px}
.seg2{display:flex;height:10px;border-radius:99px;overflow:hidden;gap:3px;margin-bottom:14px}.seg2 i{display:block;border-radius:99px;min-width:8px}
.legend{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12.5px;color:var(--mu)}.legend span{display:inline-flex;align-items:center;gap:6px}.legend i{width:8px;height:8px;border-radius:50%;display:inline-block}.legend b{color:var(--tx)}
.row{--c:var(--k-file);display:flex;align-items:center;gap:12px;padding:8px;margin:0 -8px;border-radius:14px;transition:background .15s}
.row:hover{background:var(--pill)}
.row .tile{width:38px;height:38px;border-radius:12px;flex:none}.row .tile svg.i{width:19px;height:19px}
.rm{min-width:0;display:flex;flex-direction:column}.rm b{font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rm small{color:var(--mu);font-size:12px}
.mt{display:flex;flex-direction:column;align-items:flex-start;gap:8px;color:var(--mu);font-size:13.5px;padding:6px 0}.mt svg.i{width:26px;height:26px;color:var(--ac);opacity:.8}.mt p{margin:0;line-height:1.5}
.gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.gi{position:relative;aspect-ratio:1;border-radius:18px;overflow:hidden;background:linear-gradient(150deg,color-mix(in srgb,var(--k-image) 24%,transparent),color-mix(in srgb,var(--k-image) 6%,transparent));display:grid;place-items:center;animation:rise .5s both;animation-delay:calc(var(--n)*50ms);transition:transform .25s}
.gi .tile{width:46px;height:46px;background:none}
.gi img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .4s,transform .5s}.gi img.ok{opacity:1}
.gi:hover{transform:translateY(-4px)}.gi:hover img{transform:scale(1.08)}
.gi em{position:absolute;left:0;right:0;bottom:0;padding:22px 10px 8px;font-style:normal;font-size:12px;font-weight:600;color:#fff;background:linear-gradient(transparent,rgba(0,0,0,.65));opacity:0;transition:opacity .2s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gi:hover em{opacity:1}
.keys{display:flex;flex-wrap:wrap;gap:10px 26px;padding:14px 22px;font-size:13px;color:var(--mu);background:transparent;border-style:dashed}
.keys kbd{margin-right:3px}
.pin.on svg{fill:#fbbf24;stroke:#fbbf24}
.b-wide .drives{margin-top:0}
@media(max-width:980px){.b-folders,.b-snap{grid-column:1/-1}.b-3{grid-column:span 6}}
@media(max-width:640px){.b-3{grid-column:1/-1}.home{gap:14px}.hh h1{font-size:44px}.orb{display:none}}
@media(max-width:760px){
 .item{grid-template-columns:auto 1fr auto}.col{display:none}.sub{display:block}.acts{opacity:1;transform:none}
 .grid .item{display:flex}.sbtn kbd{display:none}.field input{width:100px}.pv-nav{display:none}.brand .t{display:none}
 .list.grid{grid-template-columns:repeat(2,1fr);gap:10px}.grid .thumb{height:104px}
}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

const appJS = String.raw`
(function(){
'use strict';
var B=JSON.parse(document.getElementById('boot').textContent),UI=B.ui,ORDER=B.order,NAMES=B.names;
var FOLDER='application/vnd.google-apps.folder',PFX='Y29kZWlzcHJvdGVjdGVk';
var $=function(s,r){return(r||document).querySelector(s)};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function enc(p){return p.split('/').map(encodeURIComponent).join('/')}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}return null}

/* icons */
var P={
folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
video:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
audio:'<path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/>',
image:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 8"/>',
archive:'<path d="M4 7h16v13H4z"/><path d="M3 4h18v3H3zM10 12h4"/>',
doc:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 6l-2 12"/>',
file:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
down:'<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/>',
x:'<path d="M6 6l12 12M18 6 6 18"/>',
l:'<path d="m15 5-7 7 7 7"/>',r:'<path d="m9 5 7 7-7 7"/>',
list:'<path d="M4 6h16M4 12h16M4 18h16"/>',
grid:'<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
dense:'<path d="M4 5h16M4 9.5h16M4 14h16M4 18.5h16"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4"/>',
moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5"/>',
empty:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 13h6"/>',
cloud:'<path d="M7 18a4 4 0 0 1-.6-7.96A6 6 0 0 1 18 9.5 4.3 4.3 0 0 1 17.5 18z"/>'
};
function ic(n){return '<svg class="i" viewBox="0 0 24 24">'+(P[n]||P.file)+'</svg>'}

/* helpers */
var EXT={video:'mp4 mkv webm avi mov m4v ts flv wmv mpg mpeg 3gp',audio:'mp3 flac wav m4a aac ogg opus wma',image:'jpg jpeg png gif webp svg bmp avif ico heic',archive:'zip rar 7z tar gz bz2 xz iso',doc:'pdf doc docx txt md epub ppt pptx xls xlsx csv rtf',code:'js ts json html css py java c cpp h go rs php sh yml yaml xml sql lua ini conf log'};
var EMAP={};Object.keys(EXT).forEach(function(k){EXT[k].split(' ').forEach(function(e){EMAP[e]=k})});
function ext(n){var i=n.lastIndexOf('.');return i<0?'':n.slice(i+1).toLowerCase()}
function kind(it){var m=it.mimeType||'';if(m===FOLDER)return 'folder';var e=EMAP[ext(it.name)];if(e)return e;if(m.indexOf('video/')===0)return 'video';if(m.indexOf('audio/')===0)return 'audio';if(m.indexOf('image/')===0)return 'image';if(m.indexOf('text/')===0)return 'doc';return 'file'}
var LABEL={folder:'Folders',video:'Videos',audio:'Audio',image:'Images',doc:'Documents',archive:'Archives',code:'Code',file:'Other'};
function fsize(b){b=+b;if(!b&&b!==0||isNaN(b))return '';if(b<1)return '0 B';var u=['B','KB','MB','GB','TB'],i=Math.min(4,Math.floor(Math.log(b)/Math.log(1024)));return (b/Math.pow(1024,i)).toFixed(i?1:0).replace('.0','')+' '+u[i]}
function fdate(s){if(!s)return '';var d=new Date(s);return d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})}
function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(function(){t.classList.remove('show')},1900)}
function copy(txt){var d=function(){toast('Link copied')};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(d,fb);else fb();function fb(){var a=document.createElement('textarea');a.value=txt;document.body.appendChild(a);a.select();try{document.execCommand('copy');d()}catch(e){toast('Copy failed')}a.remove()}}

/* api */
function dec(str){var s=str.slice(20,-24).split('').reverse().join(''),bin=atob(s),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new TextDecoder().decode(u)}
function api(url,data){var f=new FormData();for(var k in data)if(data[k]!=null)f.append(k,data[k]);return fetch(url,{method:'POST',body:f}).then(function(r){if(r.status===401){location.href='/login?next='+encodeURIComponent(location.pathname+location.search);throw new Error('Session expired')}return r.text()}).then(function(t){if(t.indexOf(PFX)!==0)throw new Error('Unexpected response');return JSON.parse(dec(t))})}
var BASE='/'+ORDER+':';
function dlBase(){return UI.downloaddomain||''}
function vidBase(){return UI.videodomain||UI.downloaddomain||''}
function fileUrl(path){return BASE+enc(path)}

/* state */
var S={mode:'',path:'/',items:[],token:null,page:0,loading:false,done:true,q:'',type:'all',sort:ls('gx-sort')||'name',dir:1,view:ls('gx-view')||'list',gen:0,filter:'',pushed:false};

/* chrome */
function chrome(){
 var logo=UI.logo_image&&UI.logo_link_name?'<span class="logo"><img src="'+esc(UI.logo_link_name)+'" alt="'+esc(UI.siteName)+'"></span>':'<span class="dot">'+ic('cloud')+'</span><span class="t">'+esc(UI.siteName)+'</span>';
 $('#app').innerHTML=
 '<header class="top"><a class="brand" href="/">'+logo+'</a>'+
 '<button class="sbtn" data-pal>'+ic('search')+'<span>Search files and folders…</span><kbd>Ctrl K</kbd></button>'+
 '<button class="ibtn" id="theme" title="Toggle theme"></button>'+
 '<a class="ibtn" href="/dashboard" title="Settings">'+ic('gear')+'</a><button class="ibtn" id="logout" title="Sign out">'+ic('logout')+'</button></header>'+
 '<main class="wrap"><nav class="crumbs" id="crumbs"></nav><div class="head" id="head"></div><div class="bar" id="bar" hidden></div><div id="list" class="list"></div><div class="more" id="more"></div><div id="readme"></div></main>'+
 '<div class="ov" id="pal"><div class="pal"><div class="pal-in">'+ic('search')+'<input id="pq" placeholder="Search this drive…" autocomplete="off" spellcheck="false"><kbd>Esc</kbd></div><div class="pal-res" id="pr"></div><div class="pal-ft"><span>↑ ↓ navigate · ↵ open</span><span>Shift + ↵ full results</span></div></div></div>'+
 '<div class="ov" id="pv"></div><div id="toast"></div>';
 setTheme(ls('gx-theme')||'dark');
}
function setTheme(t){document.documentElement.dataset.theme=t;ls('gx-theme',t);$('#theme').innerHTML=ic(t==='dark'?'sun':'moon')}

function crumbs(path){
 var h='<a href="/">Home</a>',base=BASE+'/';
 var name=NAMES[ORDER]||'Drive';
 var parts=path.split('/').filter(Boolean),acc='';
 h+='<span class="sep">/</span>'+(parts.length?'<a href="'+base+'" data-nav="/">'+esc(name)+'</a>':'<b>'+esc(name)+'</b>');
 parts.forEach(function(p,i){acc+='/'+p;h+='<span class="sep">/</span>'+(i===parts.length-1?'<b>'+esc(p)+'</b>':'<a href="'+BASE+enc(acc)+'/" data-nav="'+esc(acc+'/')+'">'+esc(p)+'</a>')});
 $('#crumbs').innerHTML=h;
}

/* list rendering */
function visible(){
 var q=S.filter.toLowerCase(),a=S.items.filter(function(it){return (S.type==='all'||it._k===S.type)&&(!q||it.name.toLowerCase().indexOf(q)>-1)});
 var d=S.dir;
 a.sort(function(x,y){
  var fx=x._k==='folder',fy=y._k==='folder';if(fx!==fy)return fx?-1:1;
  if(S.sort==='size')return d*((+x.size||0)-(+y.size||0));
  if(S.sort==='date')return d*(new Date(x.modifiedTime)-new Date(y.modifiedTime));
  return d*x.name.localeCompare(y.name,undefined,{numeric:true,sensitivity:'base'})});
 return a;
}
function itemHref(it){return S.mode==='search'?'#':(BASE+enc(it._p)+(it._k==='folder'?'/':'?a=view'))}
function card(it,i){
 var k=it._k,thumb='';
 if(S.view==='grid'&&k==='image'&&S.mode!=='search'&&(+it.size||0)<4e6)thumb='<img loading="lazy" decoding="async" alt="" src="'+dlBase()+fileUrl(it._p)+'?inline=true" onload="this.classList.add(\'ok\')">';
 var isF=k==='folder',size=isF?'':fsize(it.size),date=UI.display_time===false?'':fdate(it.modifiedTime);
 return '<div class="item" data-i="'+it._i+'" style="--c:var(--k-'+k+');--n:'+i+'"><div class="thumb"><div class="tile">'+ic(k)+'</div>'+thumb+'</div>'+
 '<div class="info"><a class="name" href="'+itemHref(it)+'" title="'+esc(it.name)+'">'+esc(it.name)+'</a><div class="sub">'+[isF?'Folder':size,date].filter(Boolean).join(' · ')+'</div></div>'+
 '<div class="col">'+(UI.display_size===false?'':(isF?'—':size))+'</div><div class="col">'+date+'</div>'+
 '<div class="acts">'+(S.mode==='dir'?'<button data-act="pin" class="pin'+(isPinned(pkey(it))?' on':'')+'" title="Pin to Home">'+ic('star')+'</button>':'')+'<button data-act="copy" title="Copy link">'+ic('copy')+'</button>'+(isF||UI.display_download===false?'':'<a data-act="dl" title="Download" href="'+dlBase()+(S.mode==='search'?'#':fileUrl(it._p))+'" download>'+ic('down')+'</a>')+'</div></div>';
}
function render(){
 var v=visible(),L=$('#list');
 L.className='list'+(S.view==='grid'?' grid':S.view==='dense'?' compact':'');
 if(!v.length&&!S.loading){
  L.innerHTML='<div class="state" style="grid-column:1/-1"><div class="big">'+ic(S.items.length?'search':'empty')+'</div><h3>'+(S.items.length?'Nothing matches':(S.mode==='search'?'No results':'This folder is empty'))+'</h3><p>'+(S.items.length?'Try another filter or clear the search.':'There is nothing to show here yet.')+'</p></div>';
 }else L.innerHTML=v.map(card).join('')+(S.loading?skel(3):'');
 bar();
}
function skel(n){var s='';while(n--)s+='<div class="skel"></div>';return s}
function bar(){
 var counts={},f=0,fl=0,tot=0;
 S.items.forEach(function(it){counts[it._k]=(counts[it._k]||0)+1;if(it._k==='folder')f++;else{fl++;tot+=(+it.size||0)}});
 var order=['folder','video','audio','image','doc','code','archive','file'],chips='<button class="chip'+(S.type==='all'?' on':'')+'" data-type="all">All <em>'+S.items.length+'</em></button>';
 order.forEach(function(k){if(counts[k])chips+='<button class="chip'+(S.type===k?' on':'')+'" data-type="'+k+'">'+LABEL[k]+' <em>'+counts[k]+'</em></button>'});
 var B_=$('#bar');B_.hidden=!S.items.length&&!S.filter;
 var keep=document.activeElement&&document.activeElement.id==='ff';
 B_.innerHTML='<div class="chips">'+chips+'</div><div class="ctl"><label class="field">'+ic('search')+'<input id="ff" placeholder="Filter…" value="'+esc(S.filter)+'"></label>'+
  '<label class="field"><select id="fs"><option value="name">Name</option><option value="size">Size</option><option value="date">Modified</option></select><button id="fd" title="Reverse order">'+(S.dir>0?'↑':'↓')+'</button></label>'+
  '<div class="seg"><button data-view="list" class="'+(S.view==='list'?'on':'')+'" title="List">'+ic('list')+'</button><button data-view="grid" class="'+(S.view==='grid'?'on':'')+'" title="Grid">'+ic('grid')+'</button><button data-view="dense" class="'+(S.view==='dense'?'on':'')+'" title="Compact">'+ic('dense')+'</button></div></div>';
 $('#fs').value=S.sort;
 if(keep){var ff=$('#ff');ff.focus();ff.setSelectionRange(ff.value.length,ff.value.length)}
 if(S.mode==='dir'||S.mode==='search'){
  var more=S.done?'':'+';
  $('#head').querySelector('.stats')&&($('#head').querySelector('.stats').innerHTML='<span class="stat"><b>'+f+more+'</b> folders</span><span class="stat"><b>'+fl+more+'</b> files</span>'+(tot?'<span class="stat"><b>'+fsize(tot)+'</b> total</span>':''));
 }
}

/* data loading */
function prep(arr,base){return arr.map(function(it,i){it._k=kind(it);it._p=base?base+it.name:'';return it})}
function reindex(){S.items.forEach(function(it,i){it._i=i})}
function pwKey(){return 'gx-pw:'+ORDER+':'+S.path}
async function loadPage(first){
 if(S.loading||(!first&&S.done))return true;
 var gen=++S.gen;S.loading=true;
 if(first){S.items=[];S.token=null;S.page=0;S.done=false;$('#list').innerHTML=skel(6)}else render();
 try{
  var r;
  if(S.mode==='search')r=await api(BASE+'search',{q:S.q,page_token:S.token,page_index:S.page});
  else r=await api(BASE+enc(S.path),{page_token:S.token,page_index:S.page,password:sessionStorage.getItem(pwKey())||''});
  if(gen!==S.gen)return false;
  if(r&&r.error){S.loading=false;gate();return false}
  var files=(r&&r.data&&r.data.files)||[];
  if(r===null||(S.mode==='dir'&&!r.data)){S.loading=false;S.done=true;notfound();return false}
  S.items=S.items.concat(prep(files,S.mode==='dir'?S.path:''));reindex();
  S.token=r.nextPageToken||null;S.page=(r.curPageIndex||0)+1;S.done=!S.token;
 }catch(e){if(gen!==S.gen)return false;S.loading=false;S.done=true;errstate(e);return false}
 S.loading=false;render();
 if(first&&S.mode==='dir')readmes();
 return true;
}
function state(icon,title,msg,extra){$('#bar').hidden=true;$('#list').className='list';$('#list').innerHTML='<div class="state"><div class="big">'+ic(icon)+'</div><h3>'+title+'</h3><p>'+msg+'</p>'+(extra||'')+'</div>'}
function notfound(){state('empty','Folder not found','It may have been moved or deleted.','<br><a class="btn" href="/">Back home</a>')}
function errstate(e){state('empty','Something went wrong',esc(e.message||'Request failed')+'.','<br><button class="btn" data-retry>Try again</button>')}
function gate(bad){
 $('#bar').hidden=true;$('#list').className='list';
 $('#list').innerHTML='<form class="gate'+(bad?' bad':'')+'" id="gf"><div class="state" style="padding:20px"><div class="big">'+ic('lock')+'</div><h3>Protected folder</h3><p>'+(bad?'Incorrect password, try again.':'Enter the password to view this folder.')+'</p></div><input type="password" id="gp" placeholder="Password" autofocus><button class="btn">Unlock</button></form>';
 $('#gp').focus();
}
async function readmes(){
 $('#readme').innerHTML='';
 if(UI.render_readme_md===false||typeof marked==='undefined')return;
 var it=S.items.filter(function(x){return /^readme\.md$/i.test(x.name)})[0];
 if(!it||(+it.size||0)>300000)return;
 try{var t=await fetch(fileUrl(it._p)).then(function(r){return r.text()});$('#readme').innerHTML='<div class="md">'+safeMd(t)+'</div>'}catch(e){}
}
function safeMd(t){
 var d=new DOMParser().parseFromString(marked.parse(t),'text/html');
 d.querySelectorAll('script,style,iframe,object,embed,link,meta,form').forEach(function(n){n.remove()});
 d.querySelectorAll('*').forEach(function(n){[].slice.call(n.attributes).forEach(function(a){if(/^on/i.test(a.name)||(/^(href|src)$/i.test(a.name)&&/^\s*javascript:/i.test(a.value)))n.removeAttribute(a.name)})});
 return d.body.innerHTML;
}

/* routing */
async function route(){
 var p=location.pathname;
 closePv(true);
 if(p==='/'){return home()}
 var m=/^\/(\d+):(.*)$/.exec(p);if(!m){return home()}
 ORDER=+m[1];BASE='/'+ORDER+':';
 var rest;try{rest=decodeURIComponent(m[2])}catch(e){rest=m[2]}
 if(rest==='search'){
  S.mode='search';S.q=new URLSearchParams(location.search).get('q')||'';S.filter='';S.type='all';
  document.title='Search: '+S.q+' · '+UI.siteName;
  $('#crumbs').innerHTML='<a href="/">Home</a><span class="sep">/</span><a href="'+BASE+'/" data-nav="/">'+esc(NAMES[ORDER]||'Drive')+'</a><span class="sep">/</span><b>Search</b>';
  $('#head').innerHTML='<h1>Results for “'+esc(S.q)+'”</h1><div class="stats"></div>';
  return loadPage(true);
 }
 rest=rest||'/';
 var isDir=rest.slice(-1)==='/',view=new URLSearchParams(location.search).get('a')!==null;
 var dir=isDir?rest:rest.slice(0,rest.lastIndexOf('/')+1),file=isDir?'':rest.slice(dir.length);
 if(S.mode!=='dir'||S.path!==dir||S.order!==ORDER){
  S.mode='dir';S.path=dir;S.order=ORDER;S.filter='';S.type='all';
  crumbs(dir);
  var nm=dir==='/'?(NAMES[ORDER]||'Drive'):dir.split('/').filter(Boolean).pop();
  document.title=nm+' · '+UI.siteName;
  $('#head').innerHTML='<h1>'+esc(nm)+'</h1><div class="stats"></div>';
  var ok=await loadPage(true);if(!ok&&!file)return;
 }
 if(file&&view){
  var it=S.items.filter(function(x){return x.name===file})[0];
  if(!it){try{var r=await api(BASE+enc(rest),{});if(r&&r.id){r._k=kind(r);r._p=rest;it=r}}catch(e){}}
  if(it)openPv(it);else toast('File not found');
 }
}
/* ---- personal shelves: pins and recents are kept in this browser ---- */
function jget(k){try{return JSON.parse(ls(k)||'[]')}catch(e){return[]}}
function jset(k,v){ls(k,JSON.stringify(v))}
function pkey(it){return it._p+(it._k==='folder'?'/':'')}
function isPinned(p){return jget('gx-pins').some(function(x){return x.p===p})}
function togglePin(it){
 var a=jget('gx-pins'),k=pkey(it),n=a.filter(function(x){return x.p!==k});
 if(n.length===a.length){n.unshift({p:k,n:it.name,k:it._k});toast('Pinned to Home')}else toast('Unpinned');
 jset('gx-pins',n.slice(0,12));
}
function pushRecent(it){
 if(!it||!it._p)return;
 var a=jget('gx-recent').filter(function(x){return x.p!==it._p});
 a.unshift({p:it._p,n:it.name,k:it._k,t:Date.now()});jset('gx-recent',a.slice(0,8));
}
function agoMs(ms){var d=Math.max(0,(Date.now()-ms)/1000);if(d<60)return 'just now';if(d<3600)return Math.floor(d/60)+' min ago';if(d<86400)return Math.floor(d/3600)+' h ago';if(d<2592000)return Math.floor(d/86400)+' d ago';return new Date(ms).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}
function greet(){var h=new Date().getHours();return h<5?'Still up':h<12?'Good morning':h<17?'Good afternoon':h<22?'Good evening':'Good night'}
function hashN(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h}
var GR=[['#ff9a56','#ff5f7e'],['#8b7bff','#22d3ee'],['#34d399','#22d3ee'],['#f59e0b','#fb7185'],['#a78bfa','#f472b6'],['#38bdf8','#818cf8']];
function countUp(){
 [].forEach.call(document.querySelectorAll('[data-count]'),function(e){
  var to=+e.dataset.count,t0=null;
  function f(ts){if(!t0)t0=ts;var p=Math.min(1,(ts-t0)/900);e.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)}
  requestAnimationFrame(f);
 });
}
function heroHTML(st,note){
 var name=(UI.user||UI.siteName||'there');name=name.charAt(0).toUpperCase()+name.slice(1);
 var date=new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
 var lead=note||(st?'Your library holds <b data-count="'+st.files+'">0</b>'+(st.more?'+':'')+' files across <b data-count="'+st.folders+'">0</b>'+(st.more?'+':'')+' folders'+(st.size?' · '+fsize(st.size):'')+'.':'Browse, preview and download your files — fast, from anywhere.');
 return '<section class="hh"><span class="orb o1"></span><span class="orb o2"></span><span class="eyebrow">'+date+'</span>'+
  '<h1><span class="hello">'+greet()+',</span><br><span class="grad">'+esc(name)+'</span></h1><p class="lead">'+lead+'</p>'+
  '<div class="hh-act"><button class="hero-search" data-pal>'+ic('search')+'<span>Search everything…</span><kbd>Ctrl K</kbd></button><button class="btn" data-go="/0:/">Browse all files '+ic('r')+'</button></div></section>';
}
function rowHTML(attr,k,name,meta){
 return '<a class="row" '+attr+' href="#" style="--c:var(--k-'+k+')"><span class="tile">'+ic(k)+'</span><span class="rm"><b>'+esc(name)+'</b><small>'+esc(meta)+'</small></span></a>';
}
function bentoHTML(items,more){
 var folders=items.filter(function(x){return x._k==='folder'}),files=items.filter(function(x){return x._k!=='folder'});
 var h='';
 /* folders */
 h+='<section class="b b-folders"><div class="bt"><h3>Folders</h3><span class="bs">'+folders.length+(more?'+':'')+' in total</span></div>';
 h+=folders.length?'<div class="fgrid">'+folders.slice(0,8).map(function(it,i){var g=GR[hashN(it.name)%GR.length];return '<a class="fcard" data-open="'+it._i+'" href="#" style="--g1:'+g[0]+';--g2:'+g[1]+';--n:'+i+'"><span class="fic">'+ic('folder')+'</span><b>'+esc(it.name)+'</b><small>Open folder '+ic('r')+'</small></a>'}).join('')+'</div>':
  '<div class="mt">'+ic('empty')+'<p>No folders here yet. Everything is at the top level.</p></div>';
 h+='</section>';
 /* snapshot */
 var counts={},tot=0;items.forEach(function(it){counts[it._k]=(counts[it._k]||0)+1;if(it._k!=='folder')tot+=(+it.size||0)});
 var order=['folder','video','audio','image','doc','code','archive','file'],n=items.length||1;
 h+='<section class="b b-snap"><div class="bt"><h3>Library</h3><span class="bs">'+items.length+(more?'+':'')+' items</span></div><div class="big-n">'+(tot?fsize(tot):'—')+'</div><p class="mu">of files at the top level</p>'+
  '<div class="seg2">'+order.filter(function(k){return counts[k]}).map(function(k){return '<i style="flex:'+counts[k]+';background:var(--k-'+k+')" title="'+LABEL[k]+'"></i>'}).join('')+'</div>'+
  '<div class="legend">'+order.filter(function(k){return counts[k]}).map(function(k){return '<span><i style="background:var(--k-'+k+')"></i>'+LABEL[k]+' <b>'+counts[k]+'</b></span>'}).join('')+'</div></section>';
 /* recent */
 var recent=files.slice().sort(function(a,b){return new Date(b.modifiedTime)-new Date(a.modifiedTime)}).slice(0,5);
 h+='<section class="b b-3"><div class="bt"><h3>Recently updated</h3></div>'+(recent.length?recent.map(function(it){return rowHTML('data-open="'+it._i+'"',it._k,it.name,[fsize(it.size),it.modifiedTime?agoMs(new Date(it.modifiedTime).getTime()):''].filter(Boolean).join(' · '))}).join(''):'<div class="mt">'+ic('empty')+'<p>No files yet.</p></div>')+'</section>';
 /* continue */
 var rc=jget('gx-recent').slice(0,5);
 h+='<section class="b b-3"><div class="bt"><h3>Continue</h3></div>'+(rc.length?rc.map(function(x){return rowHTML('data-goto="'+esc(x.p)+'"',x.k,x.n,'Opened '+agoMs(x.t))}).join(''):'<div class="mt">'+ic('doc')+'<p>Files you open show up here so you can jump back in.</p></div>')+'</section>';
 /* pinned */
 var pins=jget('gx-pins').slice(0,5);
 h+='<section class="b b-3"><div class="bt"><h3>Pinned</h3></div>'+(pins.length?pins.map(function(x){return rowHTML('data-goto="'+esc(x.p)+'"',x.k,x.n,x.k==='folder'?'Folder':'File')}).join(''):'<div class="mt">'+ic('star')+'<p>Hover a file and press the star to pin it here.</p></div>')+'</section>';
 /* gallery */
 var imgs=files.filter(function(it){return it._k==='image'&&(+it.size||0)<4e6}).slice(0,10);
 if(imgs.length)h+='<section class="b b-wide"><div class="bt"><h3>Gallery</h3><span class="bs">'+imgs.length+' recent images</span></div><div class="gal">'+imgs.map(function(it,i){return '<a class="gi" data-open="'+it._i+'" href="#" style="--n:'+i+'"><span class="tile" style="--c:var(--k-image)">'+ic('image')+'</span><img loading="lazy" decoding="async" alt="'+esc(it.name)+'" src="'+dlBase()+fileUrl(it._p)+'?inline=true" onload="this.classList.add(\'ok\')"><em>'+esc(it.name)+'</em></a>'}).join('')+'</div></section>';
 /* shortcuts */
 h+='<section class="b b-wide keys"><span><kbd>Ctrl</kbd><kbd>K</kbd> search</span><span><kbd>/</kbd> quick search</span><span><kbd>←</kbd><kbd>→</kbd> next / previous in preview</span><span><kbd>Esc</kbd> close</span></section>';
 return h;
}
var HC=null;
async function home(){
 S.mode='home';S.gen++;S.filter='';S.type='all';document.title=UI.siteName;
 $('#crumbs').innerHTML='';$('#bar').hidden=true;$('#readme').innerHTML='';$('#head').innerHTML='';
 var L=$('#list');L.className='home';
 if(NAMES.length>1){
  L.innerHTML=heroHTML(null)+'<section class="b b-wide"><div class="bt"><h3>Your drives</h3></div><div class="drives">'+NAMES.map(function(n,i){return '<a class="drive" href="/'+i+':/" style="--n:'+i+'"><div class="tile">'+ic('cloud')+'</div><div><b>'+esc(n)+'</b><small>Open drive →</small></div></a>'}).join('')+'</div></section>';
  return;
 }
 ORDER=0;BASE='/0:';S.path='/';S.order=0;
 L.innerHTML=heroHTML(null)+'<div class="b b-wide">'+skel(2)+'</div>';
 try{
  if(!HC||Date.now()-HC.t>60000){
   var r=await api(BASE+'/',{page_index:0,password:sessionStorage.getItem('gx-pw:0:/')||''});
   if(S.mode!=='home')return;
   if(r&&r.error){L.innerHTML=heroHTML(null,'This folder is password protected. Open it to unlock.');return}
   var items=prep((r&&r.data&&r.data.files)||[],'/');
   HC={t:Date.now(),items:items,more:!!(r&&r.nextPageToken)};
  }
  if(S.mode!=='home')return;
  S.items=HC.items;reindex();
  var folders=0,files=0,size=0;HC.items.forEach(function(it){if(it._k==='folder')folders++;else{files++;size+=(+it.size||0)}});
  L.innerHTML=heroHTML({files:files,folders:folders,size:size,more:HC.more})+bentoHTML(HC.items,HC.more);
  countUp();
 }catch(e){if(S.mode==='home')L.innerHTML=heroHTML(null,'Could not load your files ('+esc(e.message||'error')+').')+'<div class="b b-wide"><div class="mt">'+ic('empty')+'<p><button class="btn" data-retry>Try again</button></p></div></div>'}
}
function go(url,replace){history[replace?'replaceState':'pushState']({},'',url);return route()}

/* preview */
function fileHref(it){return dlBase()+fileUrl(it._p)}
async function openPv(it){
 var k=it._k,pv=$('#pv'),url=fileHref(it),inl=url+'?inline=true',body='';
 var files=visible().filter(function(x){return x._k!=='folder'}),idx=files.indexOf(it);
 document.title=it.name+' · '+UI.siteName;
 pushRecent(it);
 var noPlayer=UI.disable_player;
 if(k==='image')body='<img alt="'+esc(it.name)+'" src="'+inl+'">';
 else if(k==='video'&&!noPlayer)body='<video controls autoplay playsinline src="'+(vidBase()+fileUrl(it._p))+'?inline=true"></video>';
 else if(k==='audio'&&!noPlayer)body='<div class="audio" id="au"><div class="disc">'+ic('audio')+'</div><div class="bars"><i></i><i></i><i></i><i></i><i></i></div><audio controls autoplay src="'+inl+'"></audio></div>';
 else if(ext(it.name)==='pdf')body='<iframe src="'+inl+'" title="'+esc(it.name)+'"></iframe>';
 else if((k==='doc'||k==='code')&&(+it.size||0)<1500000&&ext(it.name)!=='docx'&&ext(it.name)!=='doc'&&ext(it.name)!=='xlsx'&&ext(it.name)!=='pptx'&&ext(it.name)!=='ppt'&&ext(it.name)!=='xls'&&ext(it.name)!=='epub')body='<div class="state">'+skel(1)+'</div>';
 else body='<div class="nofile" style="--c:var(--k-'+k+')"><div class="tile">'+ic(k)+'</div><h3>No preview available</h3><p>'+esc(fsize(it.size))+' · '+esc(ext(it.name).toUpperCase()||'FILE')+'</p><a class="btn" href="'+url+'" download>'+ic('down')+' Download</a></div>';
 pv.innerHTML='<div class="pv-top"><div class="pv-title" style="--c:var(--k-'+k+')"><span class="tile">'+ic(k)+'</span><div><b>'+esc(it.name)+'</b><small>'+[fsize(it.size),fdate(it.modifiedTime)].filter(Boolean).join(' · ')+'</small></div></div>'+
  '<div class="pv-act"><button class="ibtn" data-pact="copy" title="Copy link">'+ic('copy')+'</button><a class="ibtn" href="'+url+'" download title="Download">'+ic('down')+'</a><button class="ibtn" data-pact="close" title="Close (Esc)">'+ic('x')+'</button></div></div>'+
  (idx>0?'<button class="pv-nav l" data-pact="prev">'+ic('l')+'</button>':'')+(idx>-1&&idx<files.length-1?'<button class="pv-nav r" data-pact="next">'+ic('r')+'</button>':'')+
  '<div class="pv-body" data-pact="bg">'+body+'</div>';
 pv.classList.add('show');document.body.style.overflow='hidden';pv._it=it;pv._files=files;pv._idx=idx;pv._url=url;
 var au=$('#au');if(au){var a=$('audio',au);a.onplay=function(){au.classList.add('play')};a.onpause=a.onended=function(){au.classList.remove('play')}}
 if(body.indexOf('class="state"')>-1){
  try{
   var t=await fetch(fileUrl(it._p)).then(function(r){return r.text()});if(pv._it!==it)return;
   $('.pv-body',pv).innerHTML=ext(it.name)==='md'&&typeof marked!=='undefined'?'<div class="md">'+safeMd(t)+'</div>':'<pre>'+esc(t)+'</pre>';
  }catch(e){$('.pv-body',pv).innerHTML='<div class="nofile"><h3>Could not load preview</h3></div>'}
 }
}
function closePv(silent){
 var pv=$('#pv');if(!pv||!pv.classList.contains('show'))return;
 pv.classList.remove('show');pv.innerHTML='';document.body.style.overflow='';
 if(!silent&&/[?&]a=/.test(location.search)){if(S.pushed){S.pushed=false;history.back()}else history.replaceState({},'',BASE+enc(S.path))}
 if(S.mode==='dir')document.title=(S.path==='/'?(NAMES[ORDER]||'Drive'):S.path.split('/').filter(Boolean).pop())+' · '+UI.siteName;
}
function stepPv(d){var pv=$('#pv'),n=pv._files[pv._idx+d];if(n){history.replaceState({},'',BASE+enc(n._p)+'?a=view');openPv(n)}}

/* resolve search-result location */
async function resolve(it){
 try{var f=new FormData();f.append('id',it.id);var p=await fetch(BASE+'id2path',{method:'POST',body:f}).then(function(r){return r.text()});
  if(!p){toast('Could not locate this item');return null}return p}catch(e){toast('Could not locate this item');return null}
}
async function openItem(it){
 if(S.mode==='search'){var p=await resolve(it);if(!p)return;S.mode='';var dir=p.slice(-1)==='/';S.pushed=false;await go(BASE+enc(p)+(dir?'':'?a=view'));S.pushed=!dir;return}
 if(it._k==='folder')return go(BASE+enc(it._p)+'/');
 history.pushState({},'',BASE+enc(it._p)+'?a=view');S.pushed=true;openPv(it);
}

/* command palette */
var PAL={res:[],sel:0,t:null,n:0};
function openPal(){$('#pal').classList.add('show');var i=$('#pq');i.value='';palMsg('Start typing to search…');i.focus()}
function closePal(){$('#pal').classList.remove('show')}
function palMsg(m){$('#pr').innerHTML='<div class="pal-msg">'+m+'</div>';PAL.res=[]}
function palRender(){
 $('#pr').innerHTML=PAL.res.map(function(it,i){return '<div class="r'+(i===PAL.sel?' sel':'')+'" data-r="'+i+'" style="--c:var(--k-'+it._k+')"><span class="tile">'+ic(it._k)+'</span><div><span>'+esc(it.name)+'</span><small>'+(it._k==='folder'?'Folder':fsize(it.size))+'</small></div></div>'}).join('');
 var s=$('.r.sel',$('#pr'));if(s)s.scrollIntoView({block:'nearest'});
}
function palSearch(q){
 clearTimeout(PAL.t);if(!q.trim())return palMsg('Start typing to search…');
 palMsg('Searching…');var n=++PAL.n;
 PAL.t=setTimeout(async function(){
  try{var r=await api('/'+ORDER+':search',{q:q,page_index:0});if(n!==PAL.n)return;
   var f=(r&&r.data&&r.data.files)||[];if(!f.length)return palMsg('No results for “'+esc(q)+'”');
   PAL.res=prep(f.slice(0,30),'');PAL.sel=0;palRender();
  }catch(e){palMsg('Search failed')}
 },260);
}
async function palPick(it){
 closePal();var sv=S.mode;S.mode='search';await openItem(it);if(S.mode==='search')S.mode=sv;
}

/* events */
document.addEventListener('click',function(e){
 var t=e.target,c;
 if((c=t.closest('[data-pal]')))return openPal();
 if(t.closest('#logout'))return fetch('/logout',{method:'POST',headers:{'X-Requested-With':'gx'}}).then(function(){location.href='/login'});
 if(t.closest('#theme'))return setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
 if((c=t.closest('[data-nav]'))&&!e.metaKey&&!e.ctrlKey){e.preventDefault();return go(c.getAttribute('href'))}
 if((c=t.closest('[data-type]'))){S.type=c.dataset.type;return render()}
 if((c=t.closest('[data-view]'))){S.view=c.dataset.view;ls('gx-view',S.view);return render()}
 if(t.closest('#fd')){S.dir*=-1;return render()}
 if(t.closest('[data-retry]'))return route();
 if((c=t.closest('#pr .r'))){return palPick(PAL.res[+c.dataset.r])}
 if(t.id==='pal')return closePal();
 if((c=t.closest('[data-pact]'))){
  var a=c.dataset.pact,pv=$('#pv');
  if(a==='bg'&&t!==c)return;
  if(a==='close'||a==='bg')return closePv();
  if(a==='copy')return copy(new URL(pv._url,location.origin).href);
  if(a==='prev')return stepPv(-1);if(a==='next')return stepPv(1);
 }
 if((c=t.closest('[data-go]'))){e.preventDefault();return go(c.dataset.go)}
 if((c=t.closest('[data-open]'))){e.preventDefault();var oi=S.items[+c.dataset.open];if(oi)openItem(oi);return}
 if((c=t.closest('[data-goto]'))){e.preventDefault();var gp=c.dataset.goto;return go(BASE+enc(gp)+(gp.slice(-1)==='/'?'':'?a=view'))}
 if((c=t.closest('.item'))){
  var it=S.items[+c.dataset.i];if(!it)return;
  var act=t.closest('[data-act]');
  if(act){
   if(act.dataset.act==='pin'){e.stopPropagation();togglePin(it);render();return}
   if(act.dataset.act==='copy'){e.stopPropagation();if(S.mode==='search')return resolve(it).then(function(p){if(p)copy(location.origin+BASE+enc(p))});return copy(location.origin+(it._k==='folder'?BASE+enc(it._p)+'/':dlBase()+fileUrl(it._p)))}
   if(act.dataset.act==='dl'){if(S.mode==='search'){e.preventDefault();resolve(it).then(function(p){if(p)location.href=dlBase()+BASE+enc(p)})}return}
  }
  if(e.metaKey||e.ctrlKey||e.shiftKey)return;
  e.preventDefault();openItem(it);
 }
});
document.addEventListener('pointermove',function(e){var c=e.target.closest&&e.target.closest('.item');if(c){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')}},{passive:true});
document.addEventListener('input',function(e){
 if(e.target.id==='ff'){S.filter=e.target.value;render()}
 if(e.target.id==='pq')palSearch(e.target.value);
});
document.addEventListener('change',function(e){if(e.target.id==='fs'){S.sort=e.target.value;ls('gx-sort',S.sort);render()}});
document.addEventListener('submit',function(e){
 if(e.target.id==='gf'){e.preventDefault();var v=$('#gp').value;sessionStorage.setItem(pwKey(),v);loadPage(true).then(function(ok){if(!ok&&$('#gf'))gate(true)})}
});
document.addEventListener('keydown',function(e){
 var pal=$('#pal').classList.contains('show'),pv=$('#pv').classList.contains('show'),typing=/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
 if((e.key==='k'&&(e.ctrlKey||e.metaKey))||(e.key==='/'&&!typing&&!pal)){e.preventDefault();return pal?closePal():openPal()}
 if(pal){
  if(e.key==='Escape')return closePal();
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(PAL.res.length){PAL.sel=(PAL.sel+(e.key==='ArrowDown'?1:-1)+PAL.res.length)%PAL.res.length;palRender()}}
  if(e.key==='Enter'){var q=$('#pq').value.trim();if(e.shiftKey&&q){location.href='/'+ORDER+':search?q='+encodeURIComponent(q)}else if(PAL.res[PAL.sel])palPick(PAL.res[PAL.sel]);else if(q)location.href='/'+ORDER+':search?q='+encodeURIComponent(q)}
  return;
 }
 if(pv&&!typing){if(e.key==='Escape')closePv();if(e.key==='ArrowLeft')stepPv(-1);if(e.key==='ArrowRight')stepPv(1)}
});
window.addEventListener('popstate',function(){S.pushed=false;route()});
new IntersectionObserver(function(en){if(en[0].isIntersecting&&(S.mode==='dir'||S.mode==='search')&&!S.loading&&!S.done&&S.items.length)loadPage(false)},{rootMargin:'400px'}).observe((chrome(),$('#more')));
route();
})();
`;

function html(current_drive_order = 0, model = {}) {
    const boot = JSON.stringify({
        order: current_drive_order,
        model: model,
        names: authConfig.roots.map(it => it.name),
        ui: {
            siteName: authConfig.siteName,
            user: authConfig.username || '',
            logo_image: uiConfig.logo_image,
            logo_link_name: uiConfig.logo_link_name,
            contact_link: uiConfig.contact_link,
            nav_link_4: uiConfig.nav_link_4,
            display_size: uiConfig.display_size,
            display_time: uiConfig.display_time,
            display_download: uiConfig.display_download,
            disable_player: uiConfig.disable_player,
            render_readme_md: uiConfig.render_readme_md,
            downloaddomain: uiConfig.downloaddomain,
            videodomain: uiConfig.videodomain
        }
    }).replace(/</g, '\\u003c');
    return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${authConfig.siteName}</title>
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="#070910">
  <link rel="icon" href="${uiConfig.favicon}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>${appCSS}</style>
  <script>try{document.documentElement.dataset.theme=localStorage.getItem('gx-theme')||'dark'}catch(e){}</script>
</head>
<body>
  <div id="app"></div>
  <script id="boot" type="application/json">${boot}</script>
  <script src="https://cdn.jsdelivr.net/npm/marked@4.0.0/marked.min.js"></script>
  <script>${appJS}</script>
</body>
</html>`;
}

/* ================= Product layer: first-run setup, login, dashboard ================= */
const SESSION_COOKIE = 'gx_session', SESSION_DAYS = 30, MAX_FAILS = 5, FAIL_WINDOW = 15 * 60;
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
/** D1 binding named DB (declared in wrangler.toml) */
const db = () => /** @type {any} */ (__env).DB;
const te = new TextEncoder();
const toHex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const fromHex = h => new Uint8Array((h.match(/../g) || []).map(x => parseInt(x, 16)));
const randHex = n => toHex(crypto.getRandomValues(new Uint8Array(n)));
const sha256hex = async s => toHex(await crypto.subtle.digest('SHA-256', te.encode(s)));
const escHtml = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function safeEq(a, b) {
    a = String(a); b = String(b);
    if (a.length !== b.length) return false;
    let r = 0;
    for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return r === 0;
}
async function hashPassword(pw, saltHex) {
    const key = await crypto.subtle.importKey('raw', te.encode(pw), 'PBKDF2', false, ['deriveBits']);
    return toHex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations: 100000 }, key, 256));
}

/* optional encryption of stored Google credentials (set a SECRET_KEY secret to enable) */
async function aesKey() {
    const k = ENV('SECRET_KEY');
    if (!k) return null;
    return crypto.subtle.importKey('raw', await crypto.subtle.digest('SHA-256', te.encode(k)), 'AES-GCM', false, ['encrypt', 'decrypt']);
}
async function seal(v) {
    const k = await aesKey();
    if (!k) return 'raw:' + v;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, te.encode(v));
    return 'enc:' + toHex(iv) + ':' + toHex(ct);
}
async function unseal(v) {
    if (!v) return '';
    if (v.startsWith('raw:')) return v.slice(4);
    if (v.startsWith('enc:')) {
        const k = await aesKey();
        if (!k) throw new Error('SECRET_KEY is required to read the stored Google credentials');
        const [, iv, ct] = v.split(':');
        return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromHex(iv) }, k, fromHex(ct)));
    }
    return v;
}

/* storage */
let schemaReady = false;
async function ensureSchema() {
    if (schemaReady) return;
    await db().batch([
        db().prepare('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)'),
        db().prepare('CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, created INTEGER, expires INTEGER, ua TEXT)'),
        db().prepare('CREATE TABLE IF NOT EXISTS attempts (ip TEXT, ts INTEGER)')
    ]);
    schemaReady = true;
}
async function getSettings() {
    const r = await db().prepare('SELECT key, value FROM settings').all();
    const o = {};
    for (const x of r.results) o[x.key] = x.value;
    return o;
}
async function setSettings(obj, bump = true) {
    if (bump) obj = Object.assign({}, obj, { cfg_ver: String(Date.now()) + randHex(2) });
    const st = db().prepare('INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    await db().batch(Object.entries(obj).map(([k, v]) => st.bind(k, String(v))));
}
let appliedVer = null;
/** copy the stored settings into authConfig and drop cached Drive state when they changed */
async function applyConfig(s) {
    if (appliedVer === s.cfg_ver) return;
    gds.length = 0;
    authConfig.expires = undefined;
    authConfig.accessToken = undefined;
    authConfig.user_drive_real_root_id = undefined;
    authConfig.siteName = s.site_name || 'My Drive';
    authConfig.username = s.username || '';
    authConfig.client_id = s.client_id || '';
    authConfig.service_account = s.auth_mode === 'sa';
    authConfig.service_account_json = {};
    if (authConfig.service_account && s.sa_json) authConfig.service_account_json = JSON.parse(await unseal(s.sa_json));
    authConfig.client_secret = await unseal(s.client_secret);
    authConfig.refresh_token = await unseal(s.refresh_token);
    authConfig.roots = [{ id: s.root_id || 'root', name: s.drive_name || 'My Drive', protect_file_link: false }];
    appliedVer = s.cfg_ver;
}

/* sessions */
async function currentSession(request) {
    const t = getCookie(request.headers.get('Cookie') || '', SESSION_COOKIE);
    if (!t) return null;
    const row = await db().prepare('SELECT id, expires FROM sessions WHERE id = ?').bind(await sha256hex(t)).first();
    if (!row || row.expires < Math.floor(Date.now() / 1000)) return null;
    return row;
}
async function createSession(request) {
    const t = randHex(32), now = Math.floor(Date.now() / 1000);
    await db().prepare('INSERT INTO sessions(id, created, expires, ua) VALUES(?, ?, ?, ?)')
        .bind(await sha256hex(t), now, now + SESSION_DAYS * 86400, (request.headers.get('User-Agent') || '').slice(0, 200)).run();
    return t;
}
const sessionCookie = (t, maxAge) => `${SESSION_COOKIE}=${t}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;

/* response helpers */
const NOSTORE = { 'Cache-Control': 'no-store' };
function redirectTo(loc, cookies) {
    const h = new Headers({ Location: loc, ...NOSTORE });
    (cookies || []).forEach(c => h.append('Set-Cookie', c));
    return new Response(null, { status: 302, headers: h });
}
function jsonResp(obj, status = 200, cookies) {
    const h = new Headers({ 'Content-Type': 'application/json', ...NOSTORE });
    (cookies || []).forEach(c => h.append('Set-Cookie', c));
    return new Response(JSON.stringify(obj), { status, headers: h });
}
const htmlResp = (body, status = 200) => new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...NOSTORE } });
function sameOrigin(request, url) {
    const o = request.headers.get('Origin');
    return !!o && o === url.origin;
}
const safeNext = n => (n && n.startsWith('/') && !n.startsWith('//') && !n.startsWith('/\\')) ? n : '/';

/* pages */
const pageCSS = String.raw`
.auth{min-height:100vh;display:grid;place-items:center;padding:24px}
.panel{width:min(480px,100%);background:var(--card);border:1px solid var(--bd);border-radius:26px;padding:clamp(22px,4vw,38px);box-shadow:var(--sh);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);animation:rise .5s both}
.panel.wide{width:min(720px,100%)}
.panel h1{font-size:27px;letter-spacing:-.03em;margin:16px 0 6px}
.sub2{color:var(--mu);margin-bottom:22px}
.mark{width:50px;height:50px;border-radius:16px;background:linear-gradient(135deg,var(--ac),var(--ac2));display:grid;place-items:center;color:#fff;box-shadow:0 12px 30px -10px var(--glow)}
.mark svg.i{width:26px;height:26px}
.f{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.f label{font-size:13px;font-weight:600}
.f input{height:46px;border-radius:12px;padding:0 14px;background:var(--bg2);border:1px solid var(--bd);color:var(--tx);font:inherit;outline:0;width:100%}
.f input:focus{border-color:var(--ac);box-shadow:0 0 0 3px var(--glow)}
.f small{color:var(--mu);font-size:12.5px}
.f textarea{border-radius:12px;padding:12px 14px;background:var(--bg2);border:1px solid var(--bd);color:var(--tx);font:12.5px/1.5 "JetBrains Mono",monospace;outline:0;width:100%;resize:vertical}
.f textarea:focus{border-color:var(--ac);box-shadow:0 0 0 3px var(--glow)}
.tabs{display:flex;gap:6px;background:var(--pill);padding:4px;border-radius:14px;margin-bottom:18px}
.tabs button{flex:1;height:42px;border-radius:11px;font-weight:600;color:var(--mu);font-size:14px}
.tabs button.on{background:var(--card-h);color:var(--tx);box-shadow:0 4px 14px -6px rgba(0,0,0,.4)}
.note{padding:10px 14px;border-radius:12px;background:var(--pill);font-size:13.5px;margin:-4px 0 14px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.msg{padding:10px 14px;border-radius:12px;margin-bottom:14px;font-size:14px;display:none}
.msg.bad{display:block;background:rgba(255,95,126,.12);border:1px solid rgba(255,95,126,.4);color:#ff8fa5}
.msg.good{display:block;background:rgba(52,211,153,.12);border:1px solid rgba(52,211,153,.4);color:#6ee7b7}
.block{width:100%}
.steps{counter-reset:s;display:flex;flex-direction:column;gap:10px;margin:0 0 24px;padding:0;list-style:none}
.steps li{counter-increment:s;position:relative;padding:12px 14px 12px 50px;border-radius:14px;background:var(--pill);font-size:14px;line-height:1.5}
.steps li::before{content:counter(s);position:absolute;left:13px;top:12px;width:25px;height:25px;border-radius:50%;background:linear-gradient(135deg,var(--ac),var(--ac2));color:#fff;display:grid;place-items:center;font-size:12px;font-weight:700}
.steps a{color:var(--ac2);text-decoration:underline}
.copy{display:flex;gap:8px;align-items:center;margin-top:8px}
.copy code{flex:1;overflow:auto;white-space:nowrap;padding:9px 11px;border-radius:10px;background:var(--bg2);border:1px solid var(--bd);font:12.5px "JetBrains Mono",monospace}
.copy button,.sm{height:36px;padding:0 14px;border-radius:10px;background:var(--bg2);border:1px solid var(--bd);font-weight:600;font-size:13px;transition:.15s}
.copy button:hover,.sm:hover{border-color:var(--ac)}
.sm.danger{color:#ff8fa5}.sm.danger:hover{border-color:#ff5f7e}
.dash{max-width:860px;margin:0 auto;padding:26px 18px 90px;display:grid;gap:18px}
.dtop{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.dtop h1{font-size:28px;letter-spacing:-.03em}
.sect{background:var(--card);border:1px solid var(--bd);border-radius:22px;padding:26px;animation:rise .5s both}
.sect h2{font-size:17px;margin-bottom:4px}.sect>p{color:var(--mu);font-size:14px;margin-bottom:16px}
.pill2{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:999px;font-size:12.5px;font-weight:600}
.pill2.ok{background:rgba(52,211,153,.14);color:#6ee7b7}.pill2.no{background:rgba(255,95,126,.14);color:#ff8fa5}
.kv{display:grid;grid-template-columns:140px 1fr;gap:8px 14px;font-size:14px;margin:14px 0}.kv span{color:var(--mu)}
.bar2{height:8px;border-radius:99px;background:var(--pill);overflow:hidden;margin-top:6px}.bar2 i{display:block;height:100%;background:linear-gradient(90deg,var(--ac),var(--ac2))}
.acts2{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}
.dwrap{max-width:1040px;margin:0 auto;padding:22px clamp(14px,3vw,28px) 90px}
.dhead{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:22px}
.dbrand{display:flex;align-items:center;gap:12px}.dbrand b{display:block;font-size:22px;letter-spacing:-.02em;line-height:1.1}.dbrand small{color:var(--mu);font-size:13px}
.mark.sm{width:42px;height:42px;border-radius:13px}.mark.sm svg.i{width:22px;height:22px}
.btn.slim{height:40px;padding:0 18px;font-size:14px}
.dhead .sm{height:40px}
.dgrid{display:grid;grid-template-columns:170px minmax(0,1fr);gap:26px;align-items:start}
.dnav{position:sticky;top:20px;display:flex;flex-direction:column;gap:4px}
.dnav a{padding:10px 14px;border-radius:12px;color:var(--mu);font-weight:500;font-size:14px;transition:.15s;border:1px solid transparent}
.dnav a:hover{color:var(--tx);background:var(--card)}
.dnav a.on{color:var(--tx);background:var(--card-h);border-color:var(--bd);box-shadow:inset 3px 0 0 var(--ac)}
#root{display:grid;gap:24px;min-width:0}
#root>section{margin:0;scroll-margin-top:24px}
.stats3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.stat3{background:var(--card);border:1px solid var(--bd);border-radius:18px;padding:16px 18px;display:flex;flex-direction:column;gap:3px;min-width:0;animation:rise .5s both}
.stat3>span{font-size:12px;color:var(--mu);text-transform:uppercase;letter-spacing:.06em;font-weight:600}
.stat3>b{font-size:19px;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stat3>b.ok{color:#6ee7b7}.stat3>b.bad{color:#ff8fa5}
.stat3 small{color:var(--mu);font-size:12.5px}.stat3 small a{color:var(--ac2);display:inline-flex;align-items:center;gap:4px}.stat3 small svg.i{width:13px;height:13px}
.banner{padding:13px 16px;border-radius:14px;font-size:14px;line-height:1.5}
.banner.bad{background:rgba(255,95,126,.1);border:1px solid rgba(255,95,126,.35);color:#ffb3c1}
.banner b{color:#ff8fa5}
.shead{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px}
.shead h2{font-size:17px;margin-bottom:2px}.shead p{color:var(--mu);font-size:14px;margin:0}
.sect>p{margin-bottom:14px}
.idrow{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 14px;border-radius:14px;background:var(--pill);margin-bottom:14px}
.idrow>span{color:var(--mu);font-size:13px}.idrow code{flex:1;min-width:0;overflow:auto;white-space:nowrap;font:13px "JetBrains Mono",monospace}
.sm.ico{display:inline-flex;align-items:center;gap:6px}.sm.ico svg.i{width:15px;height:15px}
.sm.primary{background:linear-gradient(135deg,var(--ac),var(--ac2));color:#fff;border-color:transparent}
.sm.primary:disabled{opacity:.4;cursor:not-allowed;filter:grayscale(.4)}
.sm:disabled{opacity:.6;cursor:default}
a.sm{display:inline-flex;align-items:center}
.mini{margin:0 0 16px;padding-left:20px;color:var(--mu);font-size:14px;line-height:1.8}.mini b{color:var(--tx)}.mini a{color:var(--ac2);text-decoration:underline}
.dtl{margin-top:16px;border-top:1px solid var(--bd);padding-top:14px}
.dtl summary{cursor:pointer;font-weight:600;font-size:14px;color:var(--mu);list-style:none}
.dtl summary::before{content:"+ ";color:var(--ac)}.dtl[open] summary::before{content:"\2212  "}
.dtl[open] summary{margin-bottom:14px;color:var(--tx)}
.dirty{font-size:13px;color:#fbbf24}
.meter{height:6px;border-radius:99px;background:var(--pill);overflow:hidden;margin-top:2px}
.meter i{display:block;height:100%;width:0;border-radius:99px;background:#ff5f7e;transition:width .25s,background .25s}
.meter.s2 i{background:#fbbf24}.meter.s3 i{background:#34d399}.meter.s4 i{background:#22d3ee}
.chk{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--mu);cursor:pointer}
.chk input{accent-color:var(--ac);width:16px;height:16px}
.dlist{display:grid;gap:8px}
.drow{display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:14px;background:var(--pill)}
.dico{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--card-h);color:var(--ac);flex:none}
.dmeta{flex:1;min-width:0}.dmeta b{display:block;font-weight:600;font-size:14.5px}.dmeta small{color:var(--mu);font-size:12.5px}
.me{font-style:normal;font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;background:rgba(52,211,153,.15);color:#6ee7b7;margin-left:6px;vertical-align:1px}
@media(max-width:820px){
 .dgrid{grid-template-columns:1fr;gap:14px}
 .dnav{position:sticky;top:0;z-index:20;flex-direction:row;overflow-x:auto;padding:8px 0;background:color-mix(in srgb,var(--bg) 85%,transparent);backdrop-filter:blur(12px)}
 .dnav a{white-space:nowrap}.dnav a.on{box-shadow:inset 0 -3px 0 var(--ac)}
 .stats3{grid-template-columns:1fr}
}
@media(max-width:600px){.row{grid-template-columns:1fr}.kv{grid-template-columns:1fr}}
`;
const pageJS = String.raw`
var $=function(s){return document.querySelector(s)};
function post(url,data){return fetch(url,{method:'POST',headers:{'Content-Type':'application/json','X-Requested-With':'gx'},body:JSON.stringify(data||{})}).then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(!r.ok)throw new Error(j.error||'Request failed');return j})})}
function say(el,m,good){el=typeof el==='string'?$(el):el;if(!el)return;el.textContent=m||'';el.className='msg'+(m?(good?' good':' bad'):'')}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
`;
const CLOUD_SVG = '<svg class="i" viewBox="0 0 24 24"><path d="M7 18a4 4 0 0 1-.6-7.96A6 6 0 0 1 18 9.5 4.3 4.3 0 0 1 17.5 18z"/></svg>';
const FAVICON = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#8b7bff"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><rect width="32" height="32" rx="9" fill="url(#g)"/><path d="M10 21a3.5 3.5 0 0 1-.5-7A5.2 5.2 0 0 1 19.6 13 3.8 3.8 0 0 1 21 21z" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>');

function pageShell(title, body, script) {
    return `<!DOCTYPE html>
<html lang="en" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escHtml(title)}</title><meta name="robots" content="noindex"><link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${appCSS}${pageCSS}</style>
<script>try{document.documentElement.dataset.theme=localStorage.getItem('gx-theme')||'dark'}catch(e){}</script></head>
<body>${body}<div id="toast"></div><script>${pageJS}${script || ''}</script></body></html>`;
}
function msgPage(title, text, href, label) {
    return htmlResp(pageShell(title, `<div class="auth"><div class="panel"><div class="mark">${CLOUD_SVG}</div><h1>${escHtml(title)}</h1><p class="sub2">${escHtml(text)}</p><a class="btn block" href="${escHtml(href)}">${escHtml(label || 'Continue')}</a></div></div>`));
}

function setupPage(origin, needKey) {
    const body = `<div class="auth"><div class="panel wide">
<div class="mark">${CLOUD_SVG}</div>
<h1>Set up your drive</h1>
<p class="sub2">One-time setup. Afterwards you open this site with just a username and password, no Google sign-in.</p>
<div class="tabs"><button type="button" id="t1" class="on">Service account (easiest)</button><button type="button" id="t2">Google sign-in (whole My Drive)</button></div>
<div class="msg" id="m"></div>
<form id="f" autocomplete="off">
<div id="p1">
<ol class="steps">
<li>In <a href="https://console.cloud.google.com/projectcreate" target="_blank" rel="noopener">Google Cloud Console</a> create a project and enable the <b>Google Drive API</b> (APIs &amp; Services &rarr; Library).</li>
<li>Go to <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" rel="noopener">IAM &amp; Admin &rarr; Service Accounts</a> &rarr; <b>Create service account</b> (no roles needed). Open it &rarr; <b>Keys &rarr; Add key &rarr; Create new key &rarr; JSON</b>. A file downloads.</li>
<li>In Google Drive, <b>share</b> the folder (or Shared Drive) you want to publish with the service account's email, as <b>Viewer</b>. The email is the <code>client_email</code> inside the downloaded file.</li>
<li>Paste the file's contents and the folder link below.</li>
</ol>
<div class="f"><label for="sa">Key file contents (JSON)</label><textarea id="sa" rows="5" placeholder='{ "type": "service_account", ... }'></textarea></div>
<div class="note" id="saemail" hidden></div>
<div class="f"><label for="rt">Folder or Shared Drive link</label><input id="rt" placeholder="https://drive.google.com/drive/folders/..."><small>The one you shared with the service account.</small></div>
</div>
<div id="p2" hidden>
<ol class="steps">
<li>In Google Cloud Console enable the <b>Google Drive API</b>, then open the <b>OAuth consent screen</b> (External) and set Publishing status to <b>In production</b>, otherwise the connection expires after 7 days.</li>
<li><b>Credentials &rarr; Create credentials &rarr; OAuth client ID &rarr; Web application</b>, with this Authorised redirect URI:
<div class="copy"><code id="ru">${escHtml(origin)}/oauth/callback</code><button type="button" id="cp">Copy</button></div></li>
<li>Paste the client ID and secret below. Google shows an "unverified app" warning for your own app, that is expected.</li>
</ol>
<div class="f"><label for="cid">Google client ID</label><input id="cid" placeholder="123456-abc.apps.googleusercontent.com"></div>
<div class="f"><label for="cs">Google client secret</label><input id="cs" type="password"></div>
</div>
<div class="row"><div class="f"><label for="un">Username</label><input id="un" minlength="3" maxlength="32" autocomplete="username" placeholder="e.g. alex"></div>
<div class="f"><label for="dn">Site name</label><input id="dn" maxlength="60" placeholder="My Drive"></div></div>
<div class="row"><div class="f"><label for="pw">Password</label><input id="pw" type="password" minlength="10" autocomplete="new-password"><small>At least 10 characters.</small></div>
<div class="f"><label for="pw2">Confirm password</label><input id="pw2" type="password" autocomplete="new-password"></div></div>
${needKey ? '<div class="f"><label for="sk">Setup key</label><input id="sk" type="password"><small>The SETUP_KEY secret you configured for this worker.</small></div>' : ''}
<button class="btn block" id="go">Finish setup &rarr;</button>
</form></div></div>`;
    const js = String.raw`
var mode='sa';
function pick(m){mode=m;$('#p1').hidden=m!=='sa';$('#p2').hidden=m!=='oauth';$('#t1').className=m==='sa'?'on':'';$('#t2').className=m==='oauth'?'on':'';$('#go').textContent=m==='sa'?'Finish setup →':'Connect Google Drive →';say('#m','')}
$('#t1').onclick=function(){pick('sa')};$('#t2').onclick=function(){pick('oauth')};
$('#cp').onclick=function(){navigator.clipboard.writeText($('#ru').textContent).then(function(){$('#cp').textContent='Copied'})};
$('#sa').oninput=function(){var n=$('#saemail');try{var j=JSON.parse($('#sa').value);if(j.client_email){n.hidden=false;n.innerHTML='Share your Drive folder with <b>'+esc(j.client_email)+'</b> (Viewer).';return}}catch(e){}n.hidden=true};
$('#f').onsubmit=function(e){e.preventDefault();say('#m','');
 if($('#pw').value!==$('#pw2').value)return say('#m','Passwords do not match.');
 var b=$('#go'),label=b.textContent;b.disabled=true;b.textContent=mode==='sa'?'Checking access…':'Redirecting to Google…';
 var common={username:$('#un').value,password:$('#pw').value,drive_name:$('#dn').value,setup_key:$('#sk')?$('#sk').value:''};
 var req=mode==='sa'?post('/setup/sa',Object.assign({service_account_json:$('#sa').value,root:$('#rt').value},common)).then(function(r){location.href=r.next||'/'})
  :post('/setup/start',Object.assign({client_id:$('#cid').value,client_secret:$('#cs').value},common)).then(function(r){location.href=r.url});
 req.catch(function(err){say('#m',err.message);b.disabled=false;b.textContent=label})};`;
    return pageShell('Set up', body, js);
}

function loginPage(siteName, next) {
    const body = `<div class="auth"><div class="panel">
<div class="mark">${CLOUD_SVG}</div>
<h1>${escHtml(siteName)}</h1><p class="sub2">Sign in to browse your files.</p>
<div class="msg" id="m"></div>
<form id="f"><div class="f"><label for="un">Username</label><input id="un" required autocomplete="username" autofocus></div>
<div class="f"><label for="pw">Password</label><input id="pw" type="password" required autocomplete="current-password"></div>
<button class="btn block" id="go">Sign in</button></form></div></div><div id="nx" hidden>${escHtml(next)}</div>`;
    const js = String.raw`
$('#f').onsubmit=function(e){e.preventDefault();say('#m','');var b=$('#go');b.disabled=true;
 post('/login',{username:$('#un').value,password:$('#pw').value,next:$('#nx').textContent}).then(function(r){location.href=r.next||'/'})
 .catch(function(err){say('#m',err.message);b.disabled=false})};`;
    return pageShell('Sign in - ' + siteName, body, js);
}

function dashboardPage() {
    const body = `<div class="dwrap">
<header class="dhead">
<a class="dbrand" href="/"><span class="mark sm">${CLOUD_SVG}</span><div><b>Settings</b><small id="who">&nbsp;</small></div></a>
<div class="acts2"><button class="ibtn" id="th" title="Toggle theme"></button><a class="btn slim" href="/">Open my drive</a><button class="sm" id="so">Sign out</button></div>
</header>
<div class="dgrid">
<nav class="dnav" id="nav"><a href="#connection" class="on">Connection</a><a href="#drive">Drive</a><a href="#security">Security</a><a href="#devices">Devices</a></nav>
<main id="root"><div class="skel"></div><div class="skel"></div><div class="skel"></div></main>
</div></div>`;
    const js = String.raw`
var S=null,SESS=[],checkedAt=0,pending=null;
var ICON={sun:'<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4"/></svg>',moon:'<svg class="i" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>',copy:'<svg class="i" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',ext:'<svg class="i" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5"/></svg>',dev:'<svg class="i" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',phone:'<svg class="i" viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>'};
function bytes(n){n=+n;if(!n)return '0 B';var u=['B','KB','MB','GB','TB'],i=Math.min(4,Math.floor(Math.log(n)/Math.log(1024)));return (n/Math.pow(1024,i)).toFixed(i?1:0)+' '+u[i]}
function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(function(){t.classList.remove('show')},2200)}
function ago(ts){var d=Math.max(0,Date.now()/1000-ts);if(d<60)return 'just now';if(d<3600)return Math.floor(d/60)+' min ago';if(d<86400)return Math.floor(d/3600)+' h ago';return Math.floor(d/86400)+' d ago'}
function left(ts){var d=ts-Date.now()/1000;if(d<=0)return 'expired';if(d<86400)return Math.ceil(d/3600)+' h left';return Math.floor(d/86400)+' days left'}
function uaName(s){s=s||'';var b=/Edg\//.test(s)?'Edge':/OPR\//.test(s)?'Opera':/Firefox\//.test(s)?'Firefox':/Chrome\//.test(s)?'Chrome':/Safari\//.test(s)?'Safari':'Browser';var o=/Windows/.test(s)?'Windows':/Android/.test(s)?'Android':/iPhone|iPad/.test(s)?'iOS':/Mac OS/.test(s)?'macOS':/Linux/.test(s)?'Linux':'';return b+(o?' on '+o:'')}
function copyText(t){var d=function(){toast('Copied')};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(d);else{var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');d()}catch(e){}a.remove()}}
function setTheme(t){document.documentElement.dataset.theme=t;try{localStorage.setItem('gx-theme',t)}catch(e){}$('#th').innerHTML=t==='dark'?ICON.sun:ICON.moon}
function driveLink(id){return id&&id!=='root'?'https://drive.google.com/drive/folders/'+encodeURIComponent(id):'https://drive.google.com/drive/my-drive'}
function strength(p){var s=0;if(p.length>=10)s++;if(p.length>=14)s++;if(/[a-z]/.test(p)&&/[A-Z]/.test(p))s++;if(/\d/.test(p))s++;if(/[^A-Za-z0-9]/.test(p))s++;return Math.min(4,s)}

function api(url,opts){return fetch(url,Object.assign({headers:{'X-Requested-With':'gx'}},opts||{})).then(function(r){if(r.status===401){location.href='/login?next=/dashboard';throw 0}return r.json()})}
function load(quiet){
 return Promise.all([api('/api/status'),api('/api/sessions')]).then(function(a){S=a[0];SESS=a[1].sessions||[];checkedAt=Date.now();draw()});
}

function keepInputs(fn){
 var ids=['dn','rt','cp0','np','np2','sk'],kept={},focus=document.activeElement&&document.activeElement.id;
 ids.forEach(function(i){var e=$('#'+i);if(e)kept[i]=e.value});
 fn();
 ids.forEach(function(i){var e=$('#'+i);if(e&&kept[i]!==undefined){e.value=kept[i]}});
 if(focus&&$('#'+focus)&&$('#'+focus).focus)$('#'+focus).focus();
 refreshDirty();refreshStrength();
}

function draw(){keepInputs(render)}
function render(){
 var g=S.google||{},conn=S.connected,sa=S.mode==='sa',rootOk=S.root&&S.root.ok,rootName=S.root&&S.root.name?S.root.name:(S.drive_name||'Drive');
 $('#who').textContent='Signed in as '+S.username;
 var h='';
 /* overview */
 h+='<div class="stats3">'+
  '<div class="stat3"><span>Status</span><b class="'+(conn&&!g.error&&rootOk!==false?'ok':'bad')+'">'+(!conn?'Disconnected':g.error?'Key problem':rootOk===false?'Folder not reachable':'Connected')+'</b><small>Checked '+new Date(checkedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+'</small></div>'+
  '<div class="stat3"><span>Visitors see</span><b title="'+esc(rootName)+'">'+esc(rootName)+'</b><small><a href="'+driveLink(S.root_id)+'" target="_blank" rel="noopener">Open in Google Drive '+ICON.ext+'</a></small></div>'+
  '<div class="stat3"><span>Signed-in devices</span><b>'+SESS.length+'</b><small><a href="#devices">Manage devices</a></small></div></div>';
 if(conn&&!g.error&&rootOk===false)h+='<div class="banner bad"><b>The folder is not reachable.</b> '+(sa?'In Google Drive, share it with <b>'+esc(S.sa_email)+'</b> as Viewer, then press Test connection.':'Check the root below or reconnect Google.')+'</div>';
 if(conn&&g.error)h+='<div class="banner bad"><b>Google rejected the credentials.</b> '+esc(g.error)+'</div>';
 if(!conn)h+='<div class="banner bad"><b>Not connected.</b> Your files are unavailable until you '+(sa?'add a key file below.':'reconnect Google.')+'</div>';

 /* connection */
 h+='<section class="sect" id="connection"><div class="shead"><div><h2>Connection</h2><p>'+(sa?'The site reads your Drive through a service account, read-only.':'The site reads your Drive through your Google account, read-only.')+'</p></div><span class="pill2 '+(conn&&!g.error?'ok':'no')+'">'+(conn&&!g.error?'Connected':'Needs attention')+'</span></div>';
 if(sa){
  h+='<div class="idrow"><span>Service account</span><code>'+esc(S.sa_email||'not set')+'</code>'+(S.sa_email?'<button class="sm ico" data-copy="'+esc(S.sa_email)+'">'+ICON.copy+' Copy</button>':'')+'</div>'+
   '<ol class="mini"><li>Open a folder in Google Drive and click <b>Share</b>.</li><li>Add the email above as <b>Viewer</b>.</li><li>Paste that folder link under <a href="#drive">Drive</a> below.</li></ol>'+
   '<div class="acts2"><button class="sm" id="test">Test connection</button>'+(conn?'<button class="sm danger" id="dc">Remove key</button>':'')+'</div>'+
   '<details class="dtl"'+(!conn?' open':'')+'><summary>Replace key file</summary><div class="msg" id="m3"></div><form id="f3"><div class="f"><label for="sk">Key file contents (JSON)</label><textarea id="sk" rows="4" required placeholder="Paste the whole downloaded .json file"></textarea></div><button class="sm">Save key</button></form></details>';
 }else{
  h+=(conn&&!g.error?'<div class="kv"><span>Google account</span><b>'+esc(g.email||'')+'</b><span>Storage</span><div>'+bytes(g.used)+(g.limit?' of '+bytes(g.limit):'')+(g.limit?'<div class="bar2"><i style="width:'+Math.min(100,g.used/g.limit*100)+'%"></i></div>':'')+'</div></div>':'')+
   '<div class="acts2"><button class="sm" id="test">Test connection</button><a class="sm" href="/connect">'+(conn?'Reconnect':'Connect Google')+'</a>'+(conn?'<button class="sm danger" id="dc">Disconnect</button>':'')+'</div>';
 }
 h+='</section>';

 /* drive */
 h+='<section class="sect" id="drive"><div class="shead"><div><h2>Drive</h2><p>Choose what visitors see after they sign in.</p></div></div><div class="msg" id="m1"></div>'+
  '<form id="f1"><div class="row"><div class="f"><label for="dn">Site name</label><input id="dn" maxlength="60" value="'+esc(S.drive_name)+'" data-orig="'+esc(S.drive_name)+'"></div>'+
  '<div class="f"><label for="rt">Root folder (link or ID)</label><input id="rt" value="'+esc(S.root_id)+'" data-orig="'+esc(S.root_id)+'" placeholder="https://drive.google.com/drive/folders/..."><small>'+(sa?'Must be shared with the service account.':'Use <b>root</b> for all of My Drive.')+'</small></div></div>'+
  '<div class="note">Search works fully for My Drive and Shared Drives, but not inside a single folder.</div>'+
  '<div class="acts2"><button class="sm primary" id="save1" disabled>Save changes</button><span class="dirty" id="dirty" hidden>Unsaved changes</span></div></form></section>';

 /* security */
 h+='<section class="sect" id="security"><div class="shead"><div><h2>Password</h2><p>Changing it signs out every other device.</p></div></div><div class="msg" id="m2"></div>'+
  '<form id="f2"><div class="f"><label for="cp0">Current password</label><input id="cp0" type="password" required autocomplete="current-password"></div>'+
  '<div class="row"><div class="f"><label for="np">New password</label><input id="np" type="password" required minlength="10" autocomplete="new-password"><div class="meter" id="meter"><i></i></div><small id="mtext">At least 10 characters.</small></div>'+
  '<div class="f"><label for="np2">Confirm new password</label><input id="np2" type="password" required autocomplete="new-password"></div></div>'+
  '<div class="acts2"><button class="sm primary">Change password</button><label class="chk"><input type="checkbox" id="showpw"> Show passwords</label></div></form></section>';

 /* devices */
 h+='<section class="sect" id="devices"><div class="shead"><div><h2>Devices</h2><p>Places where you are currently signed in.</p></div>'+(SESS.length>1?'<button class="sm danger" id="ro">Sign out all others</button>':'')+'</div><div class="dlist">'+
  SESS.map(function(x){var mob=/Android|iPhone|iPad|Mobile/.test(x.ua||'');return '<div class="drow"><span class="dico">'+(mob?ICON.phone:ICON.dev)+'</span><div class="dmeta"><b>'+esc(uaName(x.ua))+(x.current?' <em class="me">This device</em>':'')+'</b><small>Signed in '+ago(x.created)+' · '+left(x.expires)+'</small></div>'+(x.current?'':'<button class="sm" data-revoke="'+x.id+'">Sign out</button>')+'</div>'}).join('')+'</div></section>';
 $('#root').innerHTML=h;
 spy();
}

function refreshDirty(){
 var a=$('#dn'),b=$('#rt'),btn=$('#save1'),d=$('#dirty');if(!a||!b||!btn)return;
 var dirty=a.value!==a.dataset.orig||b.value!==b.dataset.orig;btn.disabled=!dirty;if(d)d.hidden=!dirty;
}
function refreshStrength(){
 var p=$('#np'),m=$('#meter');if(!p||!m)return;
 var s=p.value?strength(p.value):0,t=['Too short or weak','Weak','Okay','Strong','Very strong'];
 m.firstChild.style.width=(p.value?(s+1)*20:0)+'%';m.className='meter s'+s;$('#mtext').textContent=p.value?t[s]:'At least 10 characters.';
}
function spy(){
 var secs=['connection','drive','security','devices'],y=window.scrollY+140,cur=secs[0];
 secs.forEach(function(id){var e=document.getElementById(id);if(e&&e.offsetTop<=y)cur=id});
 [].forEach.call(document.querySelectorAll('#nav a'),function(a){a.className=a.getAttribute('href')==='#'+cur?'on':''});
}
window.addEventListener('scroll',spy,{passive:true});

document.addEventListener('input',function(e){
 if(e.target.id==='dn'||e.target.id==='rt')refreshDirty();
 if(e.target.id==='np')refreshStrength();
});
document.addEventListener('change',function(e){
 if(e.target.id==='showpw'){['cp0','np','np2'].forEach(function(i){$('#'+i).type=e.target.checked?'text':'password'})}
});
document.addEventListener('submit',function(e){
 var id=e.target.id;
 if(id==='f1'){e.preventDefault();say('#m1','');var b=$('#save1');b.disabled=true;b.textContent='Checking…';
  post('/api/settings',{drive_name:$('#dn').value,root_id:$('#rt').value}).then(function(){toast('Saved');return load()}).catch(function(x){say('#m1',x.message);b.textContent='Save changes';refreshDirty()})}
 if(id==='f2'){e.preventDefault();say('#m2','');
  if($('#np').value!==$('#np2').value)return say('#m2','The new passwords do not match.');
  post('/api/password',{current:$('#cp0').value,next:$('#np').value}).then(function(){['cp0','np','np2'].forEach(function(i){$('#'+i).value=''});toast('Password changed, other devices signed out');return load()}).catch(function(x){say('#m2',x.message)})}
 if(id==='f3'){e.preventDefault();say('#m3','');post('/api/sa-key',{service_account_json:$('#sk').value}).then(function(){toast('Key saved');$('#sk').value='';return load()}).catch(function(x){say('#m3',x.message)})}
});
document.addEventListener('click',function(e){
 var t=e.target,c;
 if(t.closest('#th'))return setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
 if(t.closest('#so'))return post('/logout').then(function(){location.href='/login'});
 if((c=t.closest('[data-copy]')))return copyText(c.dataset.copy);
 if(t.closest('#test')){var b=t.closest('#test');b.disabled=true;b.textContent='Testing…';return load().then(function(){toast(S.google&&S.google.error?'Google rejected the credentials':(S.root&&S.root.ok===false?'Folder not reachable':'Connection works'))})}
 if((c=t.closest('[data-revoke]')))return post('/api/sessions/revoke',{id:c.dataset.revoke}).then(function(){toast('Device signed out');return load()});
 if(t.closest('#ro'))return post('/api/revoke-others').then(function(){toast('Other devices signed out');return load()});
 if(t.closest('#dc')){var d=t.closest('#dc');
  if(pending!==d.id){pending='dc';d.textContent='Click again to confirm';clearTimeout(spy.t);spy.t=setTimeout(function(){pending=null;if($('#dc'))$('#dc').textContent=S.mode==='sa'?'Remove key':'Disconnect'},4000);return}
  pending=null;return post('/api/disconnect').then(function(){toast(S.mode==='sa'?'Key removed':'Disconnected');return load()})}
});
setTheme(document.documentElement.dataset.theme||'dark');
load();`;
    return pageShell('Settings', body, js);
}

/* routing for everything that is not the drive itself */
async function productRoute(request, url, s) {
    const p = url.pathname, m = request.method, done = s.setup_complete === '1';

    if (p === '/oauth/callback') return oauthCallback(request, url, s);
    if (p === '/setup' || p.startsWith('/setup/')) {
        if (done) return redirectTo('/');
        if (p === '/setup' && m === 'GET') return htmlResp(setupPage(url.origin, !!ENV('SETUP_KEY')));
        if (p === '/setup/start' && m === 'POST') return setupStart(request, url);
        if (p === '/setup/sa' && m === 'POST') return setupServiceAccount(request, url);
        return redirectTo('/setup');
    }
    if (!done) return redirectTo('/setup');

    if (p === '/login') {
        if (m === 'GET') {
            if (await currentSession(request)) return redirectTo(safeNext(url.searchParams.get('next')));
            return htmlResp(loginPage(s.site_name || 'My Drive', safeNext(url.searchParams.get('next'))));
        }
        if (m === 'POST') return doLogin(request, url, s);
    }

    const sess = await currentSession(request);
    if (!sess) {
        if (m !== 'GET' || p.startsWith('/api/')) return jsonResp({ error: 'Not signed in' }, 401);
        return redirectTo('/login?next=' + encodeURIComponent(p + url.search));
    }
    if (m !== 'GET' && (p === '/logout' || p.startsWith('/api/'))) {
        if (!sameOrigin(request, url) || request.headers.get('X-Requested-With') !== 'gx') return jsonResp({ error: 'Blocked request' }, 403);
    }
    if (p === '/logout' && m === 'POST') {
        await db().prepare('DELETE FROM sessions WHERE id = ?').bind(sess.id).run();
        return jsonResp({ ok: true }, 200, [sessionCookie('', 0)]);
    }
    if (p === '/dashboard' && m === 'GET') return htmlResp(dashboardPage());
    if (p === '/connect' && m === 'GET') return startReconnect(url, s);
    if (p.startsWith('/api/')) return dashboardApi(request, url, s, sess);
    return null;
}

function googleAuthUrl(clientId, origin, state) {
    return 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
        client_id: clientId, redirect_uri: origin + '/oauth/callback', response_type: 'code',
        scope: GOOGLE_SCOPE, access_type: 'offline', prompt: 'consent', state
    }).toString();
}
const oauthCookie = (state, maxAge) => `gx_oauth=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;

function checkNewLogin(user, pw) {
    if (!/^[A-Za-z0-9_.-]{3,32}$/.test(user)) return 'Username must be 3-32 letters, numbers, dots, dashes or underscores.';
    if (pw.length < 10) return 'Password must be at least 10 characters.';
    return '';
}
function parseServiceAccount(raw) {
    let j;
    try { j = JSON.parse(String(raw || '')); } catch (e) { return { error: 'That is not valid JSON. Paste the whole contents of the downloaded key file.' }; }
    if (!j || j.type !== 'service_account' || !j.client_email || !j.private_key) return { error: 'This is not a service-account key file (it should contain "type": "service_account").' };
    return { json: j };
}
function parseRoot(input) {
    let root = String(input || '').trim();
    const mt = root.match(/\/folders\/([\w-]+)/) || root.match(/\/drives\/([\w-]+)/) || root.match(/[?&]id=([\w-]+)/);
    if (mt) root = mt[1];
    return /^[\w-]+$/.test(root) ? root : '';
}
async function saToken(j) {
    const jwt = await JSONWebToken.generateGCPToken(j);
    const r = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }).toString()
    });
    const t = await r.json();
    if (!t.access_token) throw new Error(t.error_description || t.error || 'Google rejected the key');
    return t.access_token;
}

async function setupServiceAccount(request, url) {
    if (!sameOrigin(request, url)) return jsonResp({ error: 'Blocked request' }, 403);
    let b;
    try { b = await request.json(); } catch (e) { return jsonResp({ error: 'Invalid request' }, 400); }
    const need = ENV('SETUP_KEY');
    if (need && !safeEq(String(b.setup_key || ''), String(need))) return jsonResp({ error: 'Incorrect setup key' }, 403);
    const user = String(b.username || '').trim(), pw = String(b.password || '');
    const bad = checkNewLogin(user, pw);
    if (bad) return jsonResp({ error: bad }, 400);
    const parsed = parseServiceAccount(b.service_account_json);
    if (parsed.error) return jsonResp({ error: parsed.error }, 400);
    const sa = parsed.json, root = parseRoot(b.root);
    if (!root) return jsonResp({ error: 'Paste the link of the Drive folder (or Shared Drive) you shared with ' + sa.client_email + '.' }, 400);
    let tok;
    try { tok = await saToken(sa); } catch (e) { return jsonResp({ error: 'Google rejected the key: ' + (e.message || e) }, 400); }
    let found = null;
    try { found = await checkRoot({ headers: { authorization: 'Bearer ' + tok } }, root); } catch (e) { found = null; }
    if (!found) return jsonResp({ error: 'Could not open that folder. In Google Drive, share it with ' + sa.client_email + ' as Viewer, then try again.' }, 400);
    const name = String(b.drive_name || '').trim().slice(0, 60) || found.name || 'My Drive';
    const salt = randHex(16);
    await setSettings({
        auth_mode: 'sa', sa_json: await seal(JSON.stringify(sa)), sa_email: sa.client_email, client_id: '', client_secret: '', refresh_token: '',
        username: user, pass_salt: salt, pass_hash: await hashPassword(pw, salt),
        site_name: name, drive_name: name, root_id: found.id, connected: '1', setup_complete: '1', oauth_state: '', oauth_exp: '0'
    });
    return jsonResp({ ok: true, next: '/' }, 200, [sessionCookie(await createSession(request), SESSION_DAYS * 86400)]);
}

async function setupStart(request, url) {
    if (!sameOrigin(request, url)) return jsonResp({ error: 'Blocked request' }, 403);
    let b;
    try { b = await request.json(); } catch (e) { return jsonResp({ error: 'Invalid request' }, 400); }
    const need = ENV('SETUP_KEY');
    if (need && !safeEq(String(b.setup_key || ''), String(need))) return jsonResp({ error: 'Incorrect setup key' }, 403);
    const cid = String(b.client_id || '').trim(), sec = String(b.client_secret || '').trim();
    const user = String(b.username || '').trim(), pw = String(b.password || '');
    const name = String(b.drive_name || '').trim().slice(0, 60) || 'My Drive';
    if (!/^[\w-]+\.apps\.googleusercontent\.com$|^[\w.-]+\.apps\.googleusercontent\.com$/.test(cid)) return jsonResp({ error: 'That does not look like a Google client ID (it ends in .apps.googleusercontent.com).' }, 400);
    if (sec.length < 10) return jsonResp({ error: 'Enter the Google client secret.' }, 400);
    if (!/^[A-Za-z0-9_.-]{3,32}$/.test(user)) return jsonResp({ error: 'Username must be 3-32 letters, numbers, dots, dashes or underscores.' }, 400);
    if (pw.length < 10) return jsonResp({ error: 'Password must be at least 10 characters.' }, 400);
    const salt = randHex(16), state = randHex(24);
    await setSettings({
        auth_mode: 'oauth', sa_json: '', sa_email: '', client_id: cid, client_secret: await seal(sec), username: user, pass_salt: salt, pass_hash: await hashPassword(pw, salt),
        site_name: name, drive_name: name, root_id: 'root', connected: '0',
        oauth_state: state, oauth_kind: 'setup', oauth_exp: Math.floor(Date.now() / 1000) + 600
    });
    return jsonResp({ url: googleAuthUrl(cid, url.origin, state) }, 200, [oauthCookie(state, 600)]);
}

async function startReconnect(url, s) {
    if (s.auth_mode === 'sa') return redirectTo('/dashboard');
    const state = randHex(24);
    await setSettings({ oauth_state: state, oauth_kind: 'reconnect', oauth_exp: Math.floor(Date.now() / 1000) + 600 }, false);
    return redirectTo(googleAuthUrl(s.client_id, url.origin, state), [oauthCookie(state, 600)]);
}

async function oauthCallback(request, url, s) {
    const qp = url.searchParams, state = qp.get('state') || '';
    const cookie = getCookie(request.headers.get('Cookie') || '', 'gx_oauth') || '';
    const back = s.setup_complete === '1' ? '/dashboard' : '/setup';
    const fail = m => msgPage('Connection failed', m, back, 'Try again');
    if (qp.get('error')) return fail('Google reported: ' + qp.get('error'));
    if (!state || !s.oauth_state || !safeEq(state, s.oauth_state) || !safeEq(state, cookie) || Number(s.oauth_exp) < Math.floor(Date.now() / 1000))
        return fail('This link expired or was not started from this browser.');
    const kind = s.oauth_kind;
    if (kind === 'reconnect' && !(await currentSession(request))) return redirectTo('/login?next=/dashboard');
    if (kind === 'setup' && s.setup_complete === '1') return redirectTo('/');
    const code = qp.get('code');
    if (!code) return fail('Google did not return an authorization code.');
    let tok;
    try {
        const r = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ code, client_id: s.client_id, client_secret: await unseal(s.client_secret), redirect_uri: url.origin + '/oauth/callback', grant_type: 'authorization_code' }).toString()
        });
        tok = await r.json();
    } catch (e) { return fail('Could not reach Google. Please try again.'); }
    if (!tok.refresh_token) return fail(tok.error_description || 'Google did not return a refresh token. Remove this app at myaccount.google.com/permissions and connect again.');
    const upd = { refresh_token: await seal(tok.refresh_token), connected: '1', oauth_state: '', oauth_exp: '0' };
    if (kind === 'setup') upd.setup_complete = '1';
    await setSettings(upd);
    const cookies = [oauthCookie('', 0)];
    if (kind === 'setup') cookies.push(sessionCookie(await createSession(request), SESSION_DAYS * 86400));
    return redirectTo(kind === 'setup' ? '/' : '/dashboard', cookies);
}

async function doLogin(request, url, s) {
    if (!sameOrigin(request, url)) return jsonResp({ error: 'Blocked request' }, 403);
    let b;
    try { b = await request.json(); } catch (e) { return jsonResp({ error: 'Invalid request' }, 400); }
    const ip = request.headers.get('cf-connecting-ip') || 'unknown', now = Math.floor(Date.now() / 1000);
    await db().prepare('DELETE FROM attempts WHERE ts < ?').bind(now - FAIL_WINDOW).run();
    await db().prepare('DELETE FROM sessions WHERE expires < ?').bind(now).run();
    const row = await db().prepare('SELECT COUNT(*) AS n FROM attempts WHERE ip = ?').bind(ip).first();
    if (row && row.n >= MAX_FAILS) return jsonResp({ error: 'Too many attempts. Try again in 15 minutes.' }, 429);
    const userOk = safeEq(String(b.username || '').trim().toLowerCase(), String(s.username || '').toLowerCase());
    const hash = await hashPassword(String(b.password || ''), s.pass_salt || '00');
    if (!(userOk & safeEq(hash, s.pass_hash || ''))) {
        await db().prepare('INSERT INTO attempts(ip, ts) VALUES(?, ?)').bind(ip, now).run();
        return jsonResp({ error: 'Incorrect username or password.' }, 401);
    }
    await db().prepare('DELETE FROM attempts WHERE ip = ?').bind(ip).run();
    return jsonResp({ ok: true, next: safeNext(b.next) }, 200, [sessionCookie(await createSession(request), SESSION_DAYS * 86400)]);
}

async function checkRoot(opt, id) {
    if (id === 'root') return { id: 'root', name: 'My Drive' };
    let r = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=id,name,mimeType&supportsAllDrives=true`, opt);
    if (r.ok) {
        const f = await r.json();
        return f.mimeType === DriveFixedTerms.folder_mime_type ? { id: f.id, name: f.name } : null;
    }
    r = await fetch(`https://www.googleapis.com/drive/v3/drives/${encodeURIComponent(id)}?fields=id,name`, opt);
    if (r.ok) { const d = await r.json(); return { id: d.id, name: d.name }; }
    return null;
}

async function dashboardApi(request, url, s, sess) {
    const p = url.pathname;
    let b = {};
    if (request.method === 'POST') { try { b = await request.json(); } catch (e) { b = {}; } }

    if (p === '/api/status' && request.method === 'GET') {
        await applyConfig(s);
        const n = await db().prepare('SELECT COUNT(*) AS n FROM sessions WHERE expires > ?').bind(Math.floor(Date.now() / 1000)).first();
        const out = { username: s.username, drive_name: s.drive_name, root_id: s.root_id, connected: s.connected === '1', sessions: n ? n.n : 1, mode: s.auth_mode === 'sa' ? 'sa' : 'oauth', sa_email: s.sa_email || '' };
        if (out.connected && out.mode === 'sa') {
            try { await saToken(authConfig.service_account_json); out.google = { email: s.sa_email }; } catch (e) { out.google = { error: String(e.message || e) }; }
        } else if (out.connected) {
            try {
                const g = new googleDrive(authConfig, 0);
                const r = await fetch('https://www.googleapis.com/drive/v3/about?fields=user(emailAddress),storageQuota(limit,usage)', await g.requestOption());
                const a = await r.json();
                out.google = r.ok ? { email: a.user && a.user.emailAddress, used: Number(a.storageQuota && a.storageQuota.usage || 0), limit: Number(a.storageQuota && a.storageQuota.limit || 0) } : { error: (a.error && a.error.message) || 'request failed' };
            } catch (e) { out.google = { error: String(e.message || e) }; }
        }
        if (out.connected && !(out.google && out.google.error)) {
            try {
                const f = await checkRoot(await new googleDrive(authConfig, 0).requestOption(), s.root_id);
                out.root = f ? { ok: true, name: f.name } : { ok: false };
            } catch (e) { out.root = { ok: false }; }
        }
        return jsonResp(out);
    }
    if (p === '/api/settings' && request.method === 'POST') {
        let root = String(b.root_id || '').trim() || 'root';
        const mt = root.match(/\/folders\/([\w-]+)/) || root.match(/[?&]id=([\w-]+)/);
        if (mt) root = mt[1];
        if (!/^[\w-]+$/.test(root)) return jsonResp({ error: 'That is not a valid folder ID or link.' }, 400);
        if (s.connected !== '1') return jsonResp({ error: 'Connect Google first.' }, 400);
        if (s.auth_mode === 'sa' && root === 'root') return jsonResp({ error: 'Paste the link of the folder or Shared Drive you shared with the service account.' }, 400);
        await applyConfig(s);
        let found;
        try { found = await checkRoot(await new googleDrive(authConfig, 0).requestOption(), root); } catch (e) { found = null; }
        if (!found) return jsonResp({ error: 'Could not open that folder with your Google account.' }, 400);
        const name = String(b.drive_name || '').trim().slice(0, 60) || found.name || 'My Drive';
        await setSettings({ root_id: found.id, drive_name: name, site_name: name });
        return jsonResp({ ok: true });
    }
    if (p === '/api/password' && request.method === 'POST') {
        const cur = await hashPassword(String(b.current || ''), s.pass_salt);
        if (!safeEq(cur, s.pass_hash)) return jsonResp({ error: 'Current password is incorrect.' }, 403);
        const next = String(b.next || '');
        if (next.length < 10) return jsonResp({ error: 'New password must be at least 10 characters.' }, 400);
        const salt = randHex(16);
        await setSettings({ pass_salt: salt, pass_hash: await hashPassword(next, salt) }, false);
        await db().prepare('DELETE FROM sessions WHERE id != ?').bind(sess.id).run();
        return jsonResp({ ok: true });
    }
    if (p === '/api/sessions' && request.method === 'GET') {
        const rows = await db().prepare('SELECT id, created, expires, ua FROM sessions WHERE expires > ? ORDER BY created DESC').bind(Math.floor(Date.now() / 1000)).all();
        return jsonResp({ sessions: rows.results.map(r => ({ id: r.id, created: r.created, expires: r.expires, ua: r.ua || '', current: r.id === sess.id })) });
    }
    if (p === '/api/sessions/revoke' && request.method === 'POST') {
        const id = String(b.id || '');
        if (!/^[0-9a-f]{64}$/.test(id) || id === sess.id) return jsonResp({ error: 'Invalid session' }, 400);
        await db().prepare('DELETE FROM sessions WHERE id = ?').bind(id).run();
        return jsonResp({ ok: true });
    }
    if (p === '/api/revoke-others' && request.method === 'POST') {
        await db().prepare('DELETE FROM sessions WHERE id != ?').bind(sess.id).run();
        return jsonResp({ ok: true });
    }
    if (p === '/api/sa-key' && request.method === 'POST') {
        if (s.auth_mode !== 'sa') return jsonResp({ error: 'Not in service-account mode.' }, 400);
        const parsed = parseServiceAccount(b.service_account_json);
        if (parsed.error) return jsonResp({ error: parsed.error }, 400);
        let tok;
        try { tok = await saToken(parsed.json); } catch (e) { return jsonResp({ error: 'Google rejected the key: ' + (e.message || e) }, 400); }
        let ok = null;
        try { ok = await checkRoot({ headers: { authorization: 'Bearer ' + tok } }, s.root_id); } catch (e) { ok = null; }
        if (!ok) return jsonResp({ error: 'This key cannot open your current folder. Share it with ' + parsed.json.client_email + ' (Viewer) first.' }, 400);
        await setSettings({ sa_json: await seal(JSON.stringify(parsed.json)), sa_email: parsed.json.client_email, connected: '1' });
        return jsonResp({ ok: true });
    }
    if (p === '/api/disconnect' && request.method === 'POST') {
        if (s.auth_mode === 'sa') {
            await setSettings({ sa_json: '', connected: '0' });
            return jsonResp({ ok: true });
        }
        try {
            const tok = await unseal(s.refresh_token);
            if (tok) await fetch('https://oauth2.googleapis.com/revoke?token=' + encodeURIComponent(tok), { method: 'POST' });
        } catch (e) { /* best effort */ }
        await setSettings({ refresh_token: '', connected: '0' });
        return jsonResp({ ok: true });
    }
    return jsonResp({ error: 'Not found' }, 404);
}

function missingDbPage() {
    return htmlResp(pageShell('Database needed', `<div class="auth"><div class="panel"><div class="mark">${CLOUD_SVG}</div><h1>One more step</h1>
<p class="sub2">This worker needs a D1 database bound as <b>DB</b>. Run <b>npx wrangler d1 create drive-index</b>, add the printed binding to wrangler.toml, then deploy again.</p></div></div>`), 500);
}


const unauthorized = `<html>
   <head>
      <meta http-equiv="content-type" content="text/html; charset=UTF-8">
      <title>Sign in - ${authConfig.siteName}</title>
      <meta http-equiv="content-type" content="text/html; charset=UTF-8">
      <meta name="robots" content="noindex, nofollow">
      <meta name="googlebot" content="noindex, nofollow">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="icon" href="${uiConfig.favicon}">
      <script type="text/javascript" src="//code.jquery.com/jquery-3.3.1.slim.min.js"></script>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">
      <style id="compiled-css" type="text/css">.login,.image{min-height:100vh}.bg-image{background-image:url('https://cdn.jsdelivr.net/gh/logingateway/images@1.0/background.jpg');background-size:cover;background-position:center center}#error-message{display:none}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Palette+Mosaic&display=swap" rel="stylesheet">
      <style>
         .logo {
         font-family: 'Orbitron', sans-serif;
         color: #007bff;
         }
      </style>
      <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
      <script>
         $(document).ready(function()
         {
           $('form').submit(function()
           {
             var username = $('#email').val();
             var password = $('#password').val();

             $.ajax(
               {
                 'password' : password,
                 'username' : username,
                 'url'      : '',
                 'type'     : 'GET',
                 'success'  : function(){ window.location = ''; },
                 'error'    : function(){document.getElementById('error').innerHTML = 'Invalid Login Details, Retry or Contact Admin.';},
               }
             );

             return false;
           });
         });
      </script>
   </head>
   <body>
      <div class="container-fluid">
         <div class="row no-gutter">
            <div class="col-md-6 d-none d-md-flex bg-image"></div>
            <div class="col-md-6 bg-light">
               <div class="login d-flex align-items-center py-5">
                  <div class="container">
                     <div class="row">
                        <div class="col-lg-10 col-xl-7 mx-auto">
                           <h3 class="logo">${authConfig.siteName}</h3>
                           <p class="text-muted mb-4">Requires Common Sense...</p>
                           <div id="error-message" class="alert alert-danger"></div>
                           <form onsubmit="return false;" method="post">
                                <p id="error" style="color:red;"></p>
                              <div class="form-group mb-3">
                                 <input id="email" type="text" placeholder="Username" autofocus="" class="form-control rounded-pill border-0 shadow-sm px-4" required>
                              </div>
                              <div class="form-group mb-3">
                                 <input id="password" type="password" placeholder="Password" class="form-control rounded-pill border-0 shadow-sm px-4 text-primary" required>
                              </div>
                              <button id="btn-login" type="submit" class="btn btn-primary btn-block text-uppercase mb-2 rounded-pill shadow-sm">Login</button>
                              <hr class="solid">
                              <center>
                                 <p id="hidereset">
                                    <marquee>No Signup Process Available, contact your administrator for id and password at ${uiConfig.unauthorized_owner_email} or visit ${uiConfig.unauthorized_owner_link}.</marquee>
                                 </p>
                              </center>
                           </form>
                        </div>
                     </div>
                  </div>
               </div>
               <center>
                  <p>
                     &copy; <script>document.write(new Date().getFullYear())</script> ${uiConfig.company_name}
                  </p>
               </center>
            </div>
         </div>
      </div>
   </body>
</html>`

const not_found = `<!DOCTYPE html>
<html lang=en>
  <meta charset=utf-8>
  <meta name=viewport content="initial-scale=1, minimum-scale=1, width=device-width">
  <title>Error 404 (Not Found)!!1</title>
  <style>
    *{margin:0;padding:0}html,code{font:15px/22px arial,sans-serif}html{background:#fff;color:#222;padding:15px}body{margin:7% auto 0;max-width:390px;min-height:180px;padding:30px 0 15px}* > body{background:url(//www.google.com/images/errors/robot.png) 100% 5px no-repeat;padding-right:205px}p{margin:11px 0 22px;overflow:hidden}ins{color:#777;text-decoration:none}a img{border:0}@media screen and (max-width:772px){body{background:none;margin-top:0;max-width:none;padding-right:0}}#logo{background:url(//www.google.com/images/branding/googlelogo/1x/googlelogo_color_150x54dp.png) no-repeat;margin-left:-5px}@media only screen and (min-resolution:192dpi){#logo{background:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) no-repeat 0% 0%/100% 100%;-moz-border-image:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) 0}}@media only screen and (-webkit-min-device-pixel-ratio:2){#logo{background:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) no-repeat;-webkit-background-size:100% 100%}}#logo{display:inline-block;height:54px;width:150px}
  </style>
  <a href=//www.google.com/><span id=logo aria-label=Google></span></a>
  <p><b>404.</b> <ins>That’s an error.</ins>
  <p id="status"></p>

  <script>
  document.getElementById("status").innerHTML =
"The requested URL <code>" + window.location.pathname + "</code> was not found on this server.  <ins>That’s all we know.</ins>";
  </script>`

  const asn_blocked = `<html>
  <head>
  <title>Access Denied</title>
  <link href='https://fonts.googleapis.com/css?family=Lato:100' rel='stylesheet' type='text/css'>
  <style>
  body{
      margin:0;
      padding:0;
      width:100%;
      height:100%;
      color:#b0bec5;
      display:table;
      font-weight:100;
      font-family:Lato
  }
  .container{
      text-align:center;
      display:table-cell;
      vertical-align:middle
  }
  .content{
      text-align:center;
      display:inline-block
  }
  .message{
      font-size:80px;
      margin-bottom:40px
  }
  a{
      text-decoration:none;
      color:#3498db
  }

  </style>
  </head>
  <body>
  <div class="container">
  <div class="content">
  <div class="message">Access Denied</div>
  </div>
  </div>
  </body>
  </html>`

  const directlink = `
  <html>
  <head>
  <title>Direct Link - Access Denied</title>
  <link href='https://fonts.googleapis.com/css?family=Lato:100' rel='stylesheet' type='text/css'>
  <style>
  body{
      margin:0;
      padding:0;
      width:100%;
      height:100%;
      color:#b0bec5;
      display:table;
      font-weight:100;
      font-family:Lato
  }
  .container{
      text-align:center;
      display:table-cell;
      vertical-align:middle
  }
  .content{
      text-align:center;
      display:inline-block
  }
  .message{
      font-size:80px;
      margin-bottom:40px
  }
  a{
      text-decoration:none;
      color:#3498db
  }

  </style>
  </head>
  <body>
  <div class="container">
  <div class="content">
  <div class="message">Access Denied</div>
  <center><a href=""><button id="goto">Click Here to Proceed!</button></a></center>
  </div>
  </div>
  </body>
  </html>
  `

const SearchFunction = {
    formatSearchKeyword: function(keyword) {
        let nothing = "";
        let space = " ";
        if (!keyword) return nothing;
        return keyword.replace(/(!=)|['"=<>/\\:]/g, nothing)
            .replace(/[,，|(){}]/g, space)
            .trim()
    }

};

const DriveFixedTerms = new(class {
    default_file_fields = 'parents,id,name,mimeType,modifiedTime,createdTime,fileExtension,size';
    gd_root_type = {
        user_drive: 0,
        share_drive: 1
    };
    folder_mime_type = 'application/vnd.google-apps.folder';
})();

const JSONWebToken = {
    header: {
        alg: 'RS256',
        typ: 'JWT'
    },
    importKey: async function(pemKey) {
        var pemDER = this.textUtils.base64ToArrayBuffer(pemKey.split('\n').map(s => s.trim()).filter(l => l.length && !l.startsWith('---')).join(''));
        return crypto.subtle.importKey('pkcs8', pemDER, {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256'
        }, false, ['sign']);
    },
    createSignature: async function(text, key) {
        const textBuffer = this.textUtils.stringToArrayBuffer(text);
        return crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, textBuffer)
    },
    generateGCPToken: async function(serviceAccount) {
        const iat = Math.floor(Date.now() / 1000);
        var payload = {
            "iss": serviceAccount.client_email,
            "scope": "https://www.googleapis.com/auth/drive.readonly",
            "aud": "https://oauth2.googleapis.com/token",
            "exp": iat + 3600,
            "iat": iat
        };
        const b64u = x => btoa(x).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const encPayload = b64u(JSON.stringify(payload));
        const encHeader = b64u(JSON.stringify(this.header));
        var key = await this.importKey(serviceAccount.private_key);
        var signed = await this.createSignature(encHeader + "." + encPayload, key);
        return encHeader + "." + encPayload + "." + this.textUtils.arrayBufferToBase64(signed).replace(/\//g, '_').replace(/\+/g, '-').replace(/=+$/, '');
    },
    textUtils: {
        base64ToArrayBuffer: function(base64) {
            var binary_string = atob(base64);
            var len = binary_string.length;
            var bytes = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                bytes[i] = binary_string.charCodeAt(i);
            }
            return bytes.buffer;
        },
        stringToArrayBuffer: function(str) {
            var len = str.length;
            var bytes = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                bytes[i] = str.charCodeAt(i);
            }
            return bytes.buffer;
        },
        arrayBufferToBase64: function(buffer) {
            let binary = '';
            let bytes = new Uint8Array(buffer);
            let len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
        }
    }
};

// auth0.com functions
const AUTH0_DOMAIN  = auth0.domain
const AUTH0_CLIENT_ID  = auth0.clientId
const AUTH0_CLIENT_SECRET = auth0.clientSecret
const AUTH0_CALLBACK_URL = auth0.callbackUrl
const AUTH0_LOGOUT_URL = auth0.logoutUrl
const SALT = `keys565`

/** KV namespace binding (only needed when enable_auth0_com is true) */
const authKV = () => /** @type {any} */ (__env).AUTH_STORE;

const cookieKey = 'AUTH0-AUTH'

const generateStateParam = async () => {
  if(authConfig['enable_auth0_com']){
    const resp = await fetch('https://csprng.xyz/v1/api')
    const { Data: state } = await resp.json()
    await authKV().put(`state-${state}`, true, { expirationTtl: 60 })
    return state
  }
}

const exchangeCode = async code => {
  const body = JSON.stringify({
    grant_type: 'authorization_code',
    client_id: auth0.clientId,
    client_secret: auth0.clientSecret,
    code,
    redirect_uri: auth0.callbackUrl,
  })

  return persistAuth(
    await fetch(AUTH0_DOMAIN  + '/oauth/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    }),
  )
}

// https://github.com/pose/webcrypto-jwt/blob/master/index.js
const decodeJWT = function(token) {
  var output = token
    .split('.')[1]
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  switch (output.length % 4) {
    case 0:
      break
    case 2:
      output += '=='
      break
    case 3:
      output += '='
      break
    default:
      throw 'Illegal base64url string!'
  }

  const result = atob(output)

  try {
    return decodeURIComponent(escape(result))
  } catch (err) {
    console.log(err)
    return result
  }
}

const validateToken = token => {
  try {
    const dateInSecs = d => Math.ceil(Number(d) / 1000)
    const date = new Date()

    let iss = token.iss

    // ISS can include a trailing slash but should otherwise be identical to
    // the AUTH0_DOMAIN, so we should remove the trailing slash if it exists
    iss = iss.endsWith('/') ? iss.slice(0, -1) : iss

    if (iss !== AUTH0_DOMAIN) {
      throw new Error(
        `Token iss value (${iss}) doesn't match AUTH0_DOMAIN (${AUTH0_DOMAIN})`,
      )
    }

    if (token.aud !== AUTH0_CLIENT_ID) {
      throw new Error(
        `Token aud value (${token.aud}) doesn't match AUTH0_CLIENT_ID (${AUTH0_CLIENT_ID})`,
      )
    }

    if (token.exp < dateInSecs(date)) {
      throw new Error(`Token exp value is before current time`)
    }

    // Token should have been issued within the last day
    date.setDate(date.getDate() - 1)
    if (token.iat < dateInSecs(date)) {
      throw new Error(`Token was issued before one day ago and is now invalid`)
    }

    return true
  } catch (err) {
    console.log(err.message)
    return false
  }
}

const persistAuth = async exchange => {
  const body = await exchange.json()

  if (body.error) {
    throw new Error(body.error)
  }

  const date = new Date()
  date.setDate(date.getDate() + 1)

  const decoded = JSON.parse(decodeJWT(body.id_token))
  const validToken = validateToken(decoded)
  if (!validToken) {
    return { status: 401 }
  }

  const text = new TextEncoder().encode(`${SALT}-${decoded.sub}`)
  const digest = await crypto.subtle.digest({ name: 'SHA-256' }, text)
  const digestArray = new Uint8Array(digest)
  const id = btoa(String.fromCharCode.apply(null, digestArray))

  await authKV().put(id, JSON.stringify(body))

  const headers = {
    Location: '/',
    'Set-cookie': `${cookieKey}=${id}; Secure; HttpOnly; SameSite=Lax; Expires=${date.toUTCString()}`,
  }

  return { headers, status: 302 }
}

const redirectUrl = state =>
  `${auth0.domain}/authorize?response_type=code&client_id=${
    auth0.clientId
  }&redirect_uri=${
    auth0.callbackUrl
  }&scope=openid%20profile%20email&state=${encodeURIComponent(state)}`

const handleRedirect = async event => {
  const url = new URL(event.request.url)

  const state = url.searchParams.get('state')
  if (!state) {
    return null
  }

  const storedState = await authKV().get(`state-${state}`)
  if (!storedState) {
    return null
  }

  const code = url.searchParams.get('code')
  if (code) {
    return exchangeCode(code)
  }

  return null
}

function getCookie(cookie,name) {
    var nameEQ = name + "=";
    var ca = cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

async function getAssetFromKV(event){
  return null
}
const verify = async event => {
  const cookieHeader = event.request.headers.get('Cookie')

  if (cookieHeader && cookieHeader.includes(cookieKey)) {
    // cookieHeader.includes(cookieKey)
    // throw new Error(getCookie(cookieHeader,cookieKey))
    // const cookies = cookie.parse(cookieHeader)
    if (!getCookie(cookieHeader,cookieKey)) return {}
    const sub = getCookie(cookieHeader,cookieKey)

    const kvData = await authKV().get(sub)
    if (!kvData) {
      return {}
      //throw new Error('Unable to find authorization data')
    }

    let kvStored
    try {
      kvStored = JSON.parse(kvData)
    } catch (err) {
      throw new Error('Unable to parse auth information from Workers KV')
    }

    const { access_token: accessToken, id_token: idToken } = kvStored
    const userInfo = JSON.parse(decodeJWT(idToken))
    return { accessToken, idToken, userInfo }
  }
  return {}
}

const authorize = async event => {
  const authorization = await verify(event)
  if (authorization.accessToken) {
    return { authorized: true, authorization, redirectUrl: '' }
  } else {
    const state = await generateStateParam()
    return { authorized: false, authorization: {}, redirectUrl: redirectUrl(state) }
  }
}

// const logout = event => {
//   const cookieHeader = event.request.headers.get('Cookie')
//   if (cookieHeader && cookieHeader.includes(cookieKey)) {
//     return {
//       headers: {
//         'Set-cookie': `${cookieKey}=""; HttpOnly; Secure; SameSite=Lax;`,
//       },
//     }
//   }
//   return {}
// }

const hydrateState = (state = {}) => ({
  element: el => {
    el.setInnerContent(JSON.stringify(state))
  },
})


// addEventListener('fetch', event => event.respondWith(handleRequest(event)))

// see the readme for more info on what these config options do!
const config = {
  // opt into automatic authorization state hydration
  hydrateState: true,
  // return responses at the edge
  originless: true,
}

async function loginHandleRequest(event) {
  try {
    let request = event.request

    const { authorized, authorization, redirectUrl } = await authorize(event)

    const url = new URL(event.request.url)
    if (url.pathname === '/auth') {
      const authorizedResponse = await handleRedirect(event)
      if (!authorizedResponse) {
        let redirectHeaders = new Headers()
        redirectHeaders.set('Refresh', `1; url=${auth0.logoutUrl}`)
        redirectHeaders.set('Set-cookie', `${cookieKey}=""; HttpOnly; Secure; SameSite=Lax;`)
        return new Response('Unauthorized - Redirecting', { status: 302, headers: redirectHeaders })

      }
      const response = new Response(request.body, {
        ...authorizedResponse,
      })
      return response
    }

    if (!authorized) {
      return Response.redirect(redirectUrl)
    }

    if (url.pathname === '/logout') {

      let redirectHeaders = new Headers()
      redirectHeaders.set('Location', `${auth0.domain}/v2/logout?client_id=${auth0.clientId}&returnTo=${auth0.logoutUrl}`)
      redirectHeaders.set('Set-cookie', `${cookieKey}=""; HttpOnly; Secure; SameSite=Lax;`)

      return new Response('', {
          status: 302,
          headers: redirectHeaders
        })
    }

    return null

  } catch (err) {
    return new Response(err.toString())
  }
}
//end auth0.com function

const errorResponse = err => new Response('Error: ' + (err && err.stack || err), { status: 500 });

export default {
    async fetch(request, env, ctx) {
        __env = env || {};
        try {
            return await handleRequest(request, { request });
        } catch (err) {
            return errorResponse(err);
        }
    }
};

async function handleRequest(request, event) {
    var loginCheck = await loginHandleRequest(event)
    if(authConfig['enable_auth0_com'] && loginCheck != null){return loginCheck}
    const region = (request.headers.get('cf-ipcountry') || '').toUpperCase();
    let asn_servers = 0;
    try {asn_servers = request.cf.asn;}catch {asn_servers = 0;}
    const referer = request.headers.get("Referer");
    if (!db()) return missingDbPage();
    await ensureSchema();
    const settings = await getSettings();
    const productResponse = await productRoute(request, new URL(request.url), settings);
    if (productResponse) return productResponse;
    if (settings.connected !== '1') return redirectTo('/dashboard');
    await applyConfig(settings);
    if (gds.length === 0) {
        for (let i = 0; i < authConfig.roots.length; i++) {
            const gd = new googleDrive(authConfig, i);
            await gd.init();
            gds.push(gd)
        }
        let tasks = [];
        gds.forEach(gd => {
            tasks.push(gd.initRootType());
        });
        for (let task of tasks) {
            await task;
        }
    }

    let gd;
    let url = new URL(request.url);
    let path = url.pathname;
    let hostname = url.hostname;

    function redirectToIndexPage() {
        return new Response('', {
            status: 307,
            headers: {
                'Location': `${url.origin}/0:/`
            }
        });
    }

    if (region && blocked_region.includes(region)) {
        return new Response(asn_blocked, {
            status: 403,
            headers: {
                "content-type": "text/html;charset=UTF-8",
            },
        })
    } else if (blocked_asn.includes(asn_servers)) {
        return new Response(asn_blocked, {
                headers: {
                    'content-type': 'text/html;charset=UTF-8'
                },
                status: 401
            });
    } else if (path == '/') {
        return new Response(html(0, { is_home: true }), {
            status: 200,
            headers: {
                "content-type": "text/html;charset=UTF-8",
            },
        })
    }

    if (authConfig['direct_link_protection']) {
      if (referer == null){
          return new Response(directlink, {
                  headers: {
                      'content-type': 'text/html;charset=UTF-8'
                  },
                  status: 401
              });
          console.log("Refer Null");
      } else if (referer.includes(hostname)) {
          console.log("Refer Detected");
      } else {
          return new Response(directlink, {
                  headers: {
                      'content-type': 'text/html;charset=UTF-8'
                  },
                  status: 401
              });
          console.log("Wrong Refer URL");
      }
    }

    const command_reg = /^\/(?<num>\d+):(?<command>[a-zA-Z0-9]+)(\/.*)?$/g;
    const match = command_reg.exec(path);
    if (match) {
        const num = match.groups.num;
        const order = Number(num);
        if (order >= 0 && order < gds.length) {
            gd = gds[order];
        } else {
            return redirectToIndexPage()
        }
        for (const r = gd.basicAuthResponse(request); r;) return r;
        const command = match.groups.command;
        if (command === 'search') {
            if (request.method === 'POST') {
                return handleSearch(request, gd);
            } else {
                const params = url.searchParams;
                return new Response(html(gd.order, {
                    q: (params.get("q") || '').replace(/'/g, "").replace(/"/g, ""),
                    is_search_page: true,
                    root_type: gd.root_type
                }), {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/html; charset=utf-8'
                    }
                });
            }
        } else if (command === 'id2path' && request.method === 'POST') {
            return handleId2Path(request, gd)
        }
    }

    const common_reg = /^\/\d+:\/.*$/g;
    try {
        if (!path.match(common_reg)) {
            return redirectToIndexPage();
        }
        let split = path.split("/");
        let order = Number(split[1].slice(0, -1));
        if (order >= 0 && order < gds.length) {
            gd = gds[order];
        } else {
            return redirectToIndexPage()
        }
    } catch (e) {
        return redirectToIndexPage()
    }

    const basic_auth_res = gd.basicAuthResponse(request);

    path = path.replace(gd.url_path_prefix, '') || '/';
    if (request.method == 'POST') {
        return basic_auth_res || apiRequest(request, gd);
    }

    let action = url.searchParams.get('a');

    if (path.substr(-1) == '/' || action != null) {
        return basic_auth_res || new Response(html(gd.order, {
            root_type: gd.root_type
        }), {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8'
            }
        });
    } else {
      try {
      if (path.split('/').pop().toLowerCase() == ".password") {
          return basic_auth_res || new Response("", {
              status: 404
          });
      }
      let file = await gd.file(path);
      let range = request.headers.get('Range');
      const inline_down = 'true' === url.searchParams.get('inline');
      if (gd.root.protect_file_link && basic_auth_res) return basic_auth_res;
      return gd.down(file?.id, range, inline_down);
      }
      catch {
              return new Response(not_found, {
                  status: 404,
                  headers: {
                      "content-type": "text/html;charset=UTF-8",
                  },
              })
      }

    }
}

function gdiencode(str) {
    var gdijsorg_0x40df = ['1KzJBAK', '1697708zMrtEu', '295396TasIvj', '21011Eyuayv', '1217593CxovUD', 'fromCharCode', '143062xekFCR', 'replace', '74bcHwvq', '73939wlqHSM', '2CBdqkc', '1712527AcNPoP'];
    var gdijsorg_0x5556bb = gdijsorg_0x56b1;
    (function(_0x3f3911, _0x38bce9) {
        var _0x32440e = gdijsorg_0x56b1;
        while (true) {
            try {
                var _0x2cab6f = -parseInt(_0x32440e(0xb3)) + -parseInt(_0x32440e(0xb7)) * -parseInt(_0x32440e(0xb6)) + -parseInt(_0x32440e(0xaf)) * -parseInt(_0x32440e(0xad)) + -parseInt(_0x32440e(0xb1)) + parseInt(_0x32440e(0xae)) + parseInt(_0x32440e(0xac)) + parseInt(_0x32440e(0xb0)) * -parseInt(_0x32440e(0xb5));
                if (_0x2cab6f === _0x38bce9) break;
                else _0x3f3911['push'](_0x3f3911['shift']());
            } catch (_0x34d506) {
                _0x3f3911['push'](_0x3f3911['shift']());
            }
        }
    }(gdijsorg_0x40df, 0xe5038));

    function gdijsorg_0x56b1(_0x1ccc20, _0x1596c4) {
        _0x1ccc20 = _0x1ccc20 - 0xac;
        var _0x40df0f = gdijsorg_0x40df[_0x1ccc20];
        return _0x40df0f;
    }
    return btoa(encodeURIComponent(str)[gdijsorg_0x5556bb(0xb4)](/%([0-9A-F]{2})/g, function toSolidBytes(_0xe8cc7f, _0x12410f) {
        var _0x1cce23 = gdijsorg_0x5556bb;
        return String[_0x1cce23(0xb2)]('0x' + _0x12410f);
    }));
}

async function apiRequest(request, gd) {
    let url = new URL(request.url);
    let path = url.pathname;
    path = path.replace(gd.url_path_prefix, '') || '/';

    let option = {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    }

    if (path.substr(-1) == '/') {
        let form = await request.formData();
        let deferred_list_result = gd.list(path, form.get('page_token'), Number(form.get('page_index')));

        if (authConfig['enable_password_file_verify']) {
            let password = await gd.password(path);
            // console.log("dir password", password);
            if (password && password.replace("\n", "") !== form.get('password')) {
                let html = `Y29kZWlzcHJvdGVjdGVk=0Xfi4icvJnclBCZy92dzNXYwJCI6ISZnF2czVWbiwSMwQDI6ISZk92YisHI6IicvJnclJyeYmFzZTY0aXNleGNsdWRlZA==`;
                return new Response(html, option);
            }
        }

        let list_result = await deferred_list_result;
        return new Response(rewrite(gdiencode(JSON.stringify(list_result))));
    } else {
        let file = await gd.file(path);
        let range = request.headers.get('Range');
        return new Response(rewrite(gdiencode(JSON.stringify(file))));
    }
}

// deal with search
async function handleSearch(request, gd) {
    const option = {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    };
    let form = await request.formData();
    let search_result = await
    gd.search(form.get('q') || '', form.get('page_token'), Number(form.get('page_index')));
    return new Response(rewrite(gdiencode(JSON.stringify(search_result))));
}

async function handleId2Path(request, gd) {
    const option = {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    };
    let form = await request.formData();
    let path = await gd.findPathById(form.get('id'));
    return new Response(path || '', option);
}

class googleDrive {
    constructor(authConfig, order) {
        this.order = order;
        this.root = authConfig.roots[order];
        this.root.protect_file_link = this.root.protect_file_link || false;
        this.url_path_prefix = `/${order}:`;
        this.authConfig = authConfig;
        this.paths = [];
        this.files = [];
        this.passwords = [];
        this.id_path_cache = {};
        this.id_path_cache[this.root['id']] = '/';
        this.paths["/"] = this.root['id'];
    }
    async init() {
        await this.accessToken();
        if (authConfig.user_drive_real_root_id) return;
        const root_obj = await (gds[0] || this).findItemById('root');
        if (root_obj && root_obj.id) {
            authConfig.user_drive_real_root_id = root_obj.id
        }
    }

    async initRootType() {
        const root_id = this.root['id'];
        const types = DriveFixedTerms.gd_root_type;
        if (root_id === 'root' || root_id === authConfig.user_drive_real_root_id) {
            this.root_type = types.user_drive;
        } else {
            this.root_type = types.share_drive;
        }
    }

    basicAuthResponse(request) {
        let url = new URL(request.url);
        let path = url.pathname;
        const auth = this.root.auth || '',
            _401 = new Response(unauthorized, {
                headers: {
                    'WWW-Authenticate': `Basic realm="goindex:drive:${this.order}"`,
                    'content-type': 'text/html;charset=UTF-8'
                },
                status: 401
            });
        if (authConfig['lock_folders']) {
            if (auth && path.endsWith("/") || path.endsWith("search")) {
                const _auth = request.headers.get('Authorization')
                if (_auth) {
                    const [received_user, received_pass] = atob(_auth.split(' ').pop()).split(':');
                    if (auth.hasOwnProperty(received_user)) {
                        if (auth[received_user] == received_pass) {
                            return null;
                        } else return _401;
                    } else return _401;
                }
            } else return null;
        } else {
                if (auth) {
                    const _auth = request.headers.get('Authorization')
                    if (_auth) {
                        const [received_user, received_pass] = atob(_auth.split(' ').pop()).split(':');
                        if (auth.hasOwnProperty(received_user)) {
                            if (auth[received_user] == received_pass) {
                                return null;
                            } else return _401;
                        } else return _401;
                    }
                } else return null;
        }
        return _401;
    }

    async down(id, range = '', inline = false) {
        let url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
        let requestOption = await this.requestOption();
        requestOption.headers['Range'] = range;
        let res;
         for (let i = 0; i < 3; i++) {
             res = await fetch(url, requestOption);
             if (res.ok) {
                 break;
             }
             await this.sleep(800 * (i + 1));
             console.log(res);
         }
        const second_domain_for_dl = `${uiConfig.second_domain_for_dl}`
        if (second_domain_for_dl == 'true') {
            const res = await fetch(`${uiConfig.jsdelivr_cdn_src}@${uiConfig.version}/assets/disable_download.html`);
            return new Response(await res.text(), {
                headers: {
                    "content-type": "text/html;charset=UTF-8",
                },
            })
        }
        else if (res.ok) {
            const {
                headers
            } = res = new Response(res.body, res)
            this.authConfig.enable_cors_file_down && headers.append('Access-Control-Allow-Origin', '*');
            inline === true && headers.set('Content-Disposition', 'inline');
            return res;
        }
        else if(res.status == 404){
            return new Response(not_found, {
                status: 404,
                headers: {
                    "content-type": "text/html;charset=UTF-8",
                },
            })
        }
        else {
            const res = await fetch(`${uiConfig.jsdelivr_cdn_src}@${uiConfig.version}/assets/download_error.html`);
            return new Response(await res.text(), {
                headers: {
                    "content-type": "text/html;charset=UTF-8",
                },
            })
        }
    }

    async file(path) {
        if (typeof this.files[path] == 'undefined') {
            this.files[path] = await this._file(path);
        }
        return this.files[path];
    }

    async _file(path) {
        let arr = path.split('/');
        let name = arr.pop();
        name = decodeURIComponent(name).replace(/\'/g, "\\'");
        let dir = arr.join('/') + '/';
        // console.log(name, dir);
        let parent = await this.findPathId(dir);
        // console.log(parent);
        let url = 'https://www.googleapis.com/drive/v3/files';
        let params = {
            'includeItemsFromAllDrives': true,
            'supportsAllDrives': true
        };
        params.q = `'${parent}' in parents and name = '${name}' and trashed = false and mimeType != 'application/vnd.google-apps.shortcut'`;
        params.fields = "files(id, name, mimeType, size ,createdTime, modifiedTime, iconLink, thumbnailLink)";
        url += '?' + this.enQuery(params);
        let requestOption = await this.requestOption();
        let response;
        for (let i = 0; i < 3; i++) {
            response = await fetch(url, requestOption);
            if (response.ok) {
                break;
            }
            await this.sleep(800 * (i + 1));
        }
        let obj = await response.json();
        // console.log(obj);
        return obj.files[0];
    }

    async list(path, page_token = null, page_index = 0) {
        if (this.path_children_cache == undefined) {
            // { <path> :[ {nextPageToken:'',data:{}}, {nextPageToken:'',data:{}} ...], ...}
            this.path_children_cache = {};
        }

        if (this.path_children_cache[path] &&
            this.path_children_cache[path][page_index] &&
            this.path_children_cache[path][page_index].data
        ) {
            let child_obj = this.path_children_cache[path][page_index];
            return {
                nextPageToken: child_obj.nextPageToken || null,
                curPageIndex: page_index,
                data: child_obj.data
            };
        }

        let id = await this.findPathId(path);
        let result = await this._ls(id, page_token, page_index);
        let data = result.data;
        if (result.nextPageToken && data.files) {
            if (!Array.isArray(this.path_children_cache[path])) {
                this.path_children_cache[path] = []
            }
            this.path_children_cache[path][Number(result.curPageIndex)] = {
                nextPageToken: result.nextPageToken,
                data: data
            };
        }

        return result
    }


    async _ls(parent, page_token = null, page_index = 0) {

        if (parent == undefined) {
            return null;
        }
        let obj;
        let params = {
            'includeItemsFromAllDrives': true,
            'supportsAllDrives': true
        };
        params.q = `'${parent}' in parents and trashed = false AND name !='.password' and mimeType != 'application/vnd.google-apps.shortcut' and mimeType != 'application/vnd.google-apps.document' and mimeType != 'application/vnd.google-apps.spreadsheet' and mimeType != 'application/vnd.google-apps.form' and mimeType != 'application/vnd.google-apps.site'`;
        params.orderBy = 'folder,name,modifiedTime desc';
        params.fields = "nextPageToken, files(id, name, mimeType, size , modifiedTime)";
        params.pageSize = this.authConfig.files_list_page_size;

        if (page_token) {
            params.pageToken = page_token;
        }
        let url = 'https://www.googleapis.com/drive/v3/files';
        url += '?' + this.enQuery(params);
        let requestOption = await this.requestOption();
        let response;
        for (let i = 0; i < 3; i++) {
            response = await fetch(url, requestOption);
            if (response.ok) {
                break;
            }
            await this.sleep(800 * (i + 1));
        }
        obj = await response.json();

        return {
            nextPageToken: obj.nextPageToken || null,
            curPageIndex: page_index,
            data: obj
        };
    }

    async password(path) {
        if (this.passwords[path] !== undefined) {
            return this.passwords[path];
        }

        let file = await this.file(path + '.password');
        if (file == undefined) {
            this.passwords[path] = null;
        } else {
            let url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
            let requestOption = await this.requestOption();
            let response = await this.fetch200(url, requestOption);
            this.passwords[path] = await response.text();
        }

        return this.passwords[path];
    }

    async search(origin_keyword, page_token = null, page_index = 0) {
        const types = DriveFixedTerms.gd_root_type;
        const is_user_drive = this.root_type === types.user_drive;
        const is_share_drive = this.root_type === types.share_drive;
        const convert_search_to_google_drive_app = `${uiConfig.convert_search_to_google_drive_app}`
        const empty_result = {
            nextPageToken: null,
            curPageIndex: page_index,
            data: null
        };

        if (!is_user_drive && !is_share_drive) {
            return empty_result;
        }
        let keyword = SearchFunction.formatSearchKeyword(origin_keyword);
        if (!keyword) {
            return empty_result;
        }
        let words = keyword.split(/\s+/);
        let name_search_str = `name contains '${words.join("' AND name contains '")}'`;
        let params = {};
        if (is_user_drive) {
            if (convert_search_to_google_drive_app == 'true') {
                params.corpora = 'allDrives';
                params.includeItemsFromAllDrives = true;
                params.supportsAllDrives = true;
            }
            else {
                params.corpora = 'user';
            }
        }
        if (is_share_drive) {
            if (convert_search_to_google_drive_app == 'true') {
                params.corpora = 'allDrives';
            }
            else {
                params.corpora = 'drive';
                params.driveId = this.root.id;
            }
            params.includeItemsFromAllDrives = true;
            params.supportsAllDrives = true;
        }
        if (page_token) {
            params.pageToken = page_token;
        }
        params.q = `trashed = false AND mimeType != 'application/vnd.google-apps.shortcut' and mimeType != 'application/vnd.google-apps.document' and mimeType != 'application/vnd.google-apps.spreadsheet' and mimeType != 'application/vnd.google-apps.form' and mimeType != 'application/vnd.google-apps.site' AND name !='.password' AND (${name_search_str})`;
        params.fields = "nextPageToken, files(id, driveId, name, mimeType, size , modifiedTime)";
        params.pageSize = this.authConfig.search_result_list_page_size;
        params.orderBy = 'folder,name,modifiedTime desc';

        let url = 'https://www.googleapis.com/drive/v3/files';
        url += '?' + this.enQuery(params);
        let requestOption = await this.requestOption();
        let response;
        for (let i = 0; i < 3; i++) {
            response = await fetch(url, requestOption);
            if (response.ok) {
                break;
            }
            await this.sleep(800 * (i + 1));
        }
        let res_obj = await response.json();

        return {
            nextPageToken: res_obj.nextPageToken || null,
            curPageIndex: page_index,
            data: res_obj
        };
    }

    async findParentFilesRecursion(child_id, contain_myself = true) {
        const gd = this;
        const gd_root_id = gd.root.id;
        const user_drive_real_root_id = authConfig.user_drive_real_root_id;
        const is_user_drive = gd.root_type === DriveFixedTerms.gd_root_type.user_drive;
        const target_top_id = is_user_drive ? user_drive_real_root_id : gd_root_id;
        const fields = DriveFixedTerms.default_file_fields;
        const parent_files = [];
        let meet_top = false;

        async function addItsFirstParent(file_obj) {
            if (!file_obj) return;
            if (!file_obj.parents) return;
            if (file_obj.parents.length < 1) return;
            let p_ids = file_obj.parents;
            if (p_ids && p_ids.length > 0) {
                const first_p_id = p_ids[0];
                if (first_p_id === target_top_id) {
                    meet_top = true;
                    return;
                }
                const p_file_obj = await gd.findItemById(first_p_id);
                if (p_file_obj && p_file_obj.id) {
                    parent_files.push(p_file_obj);
                    await addItsFirstParent(p_file_obj);
                }
            }
        }

        const child_obj = await gd.findItemById(child_id);
        if (contain_myself) {
            parent_files.push(child_obj);
        }
        await addItsFirstParent(child_obj);

        return meet_top ? parent_files : null
    }

    async findPathById(child_id) {
        if (this.id_path_cache[child_id]) {
            return this.id_path_cache[child_id];
        }

        const p_files = await this.findParentFilesRecursion(child_id);
        if (!p_files || p_files.length < 1) return '';

        let cache = [];
        // Cache the path and id of each level found
        p_files.forEach((value, idx) => {
            const is_folder = idx === 0 ? (p_files[idx].mimeType === DriveFixedTerms.folder_mime_type) : true;
            let path = '/' + p_files.slice(idx).map(it => it.name).reverse().join('/');
            if (is_folder) path += '/';
            cache.push({
                id: p_files[idx].id,
                path: path
            })
        });

        cache.forEach((obj) => {
            this.id_path_cache[obj.id] = obj.path;
            this.paths[obj.path] = obj.id
        });
        return cache[0].path;
    }

    async findItemById(id) {
        const is_user_drive = this.root_type === DriveFixedTerms.gd_root_type.user_drive;
        let url = `https://www.googleapis.com/drive/v3/files/${id}?fields=${DriveFixedTerms.default_file_fields}${is_user_drive ? '' : '&supportsAllDrives=true'}`;
        let requestOption = await this.requestOption();
        let res = await fetch(url, requestOption);
        return await res.json()
    }

    async findPathId(path) {
        let c_path = '/';
        let c_id = this.paths[c_path];

        let arr = path.trim('/').split('/');
        for (let name of arr) {
            c_path += name + '/';

            if (typeof this.paths[c_path] == 'undefined') {
                let id = await this._findDirId(c_id, name);
                this.paths[c_path] = id;
            }

            c_id = this.paths[c_path];
            if (c_id == undefined || c_id == null) {
                break;
            }
        }
        return this.paths[path];
    }

    async _findDirId(parent, name) {
        name = decodeURIComponent(name).replace(/\'/g, "\\'");
        if (parent == undefined) {
            return null;
        }

        let url = 'https://www.googleapis.com/drive/v3/files';
        let params = {
            'includeItemsFromAllDrives': true,
            'supportsAllDrives': true
        };
        params.q = `'${parent}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${name}'  and trashed = false`;
        params.fields = "nextPageToken, files(id, name, mimeType)";
        url += '?' + this.enQuery(params);
        let requestOption = await this.requestOption();
        let response;
        for (let i = 0; i < 3; i++) {
            response = await fetch(url, requestOption);
            if (response.ok) {
                break;
            }
            await this.sleep(800 * (i + 1));
        }
        let obj = await response.json();
        if (obj.files[0] == undefined) {
            return null;
        }
        return obj.files[0].id;
    }

    async accessToken() {
        console.log("accessToken");
        if (this.authConfig.expires == undefined || this.authConfig.expires < Date.now()) {
            const obj = await this.fetchAccessToken();
            if (obj.access_token != undefined) {
                this.authConfig.accessToken = obj.access_token;
                this.authConfig.expires = Date.now() + 3500 * 1000;
            }
        }
        return this.authConfig.accessToken;
    }

    async fetchAccessToken() {
        console.log("fetchAccessToken");
        const url = "https://www.googleapis.com/oauth2/v4/token";
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        var post_data;
        if (this.authConfig.service_account && typeof this.authConfig.service_account_json != "undefined") {
            const jwttoken = await JSONWebToken.generateGCPToken(this.authConfig.service_account_json);
            post_data = {
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwttoken,
            };
        } else {
            post_data = {
                client_id: this.authConfig.client_id,
                client_secret: this.authConfig.client_secret,
                refresh_token: this.authConfig.refresh_token,
                grant_type: "refresh_token",
            };
        }

        let requestOption = {
            'method': 'POST',
            'headers': headers,
            'body': this.enQuery(post_data)
        };

        let response;
        for (let i = 0; i < 3; i++) {
            response = await fetch(url, requestOption);
            if (response.ok) {
                break;
            }
            await this.sleep(800 * (i + 1));
        }
        return await response.json();
    }

    async fetch200(url, requestOption) {
      let response;
      for (let i = 0; i < 3; i++) {
          response = await fetch(url, requestOption);
          if (response.ok) {
              break;
          }
          await this.sleep(800 * (i + 1));
      }
        return response;
    }

    async requestOption(headers = {}, method = 'GET') {
        const accessToken = await this.accessToken();
        headers['authorization'] = 'Bearer ' + accessToken;
        return {
            'method': method,
            'headers': headers
        };
    }

    enQuery(data) {
        const ret = [];
        for (let d in data) {
            ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
        }
        return ret.join('&');
    }

    sleep(ms) {
        return new Promise(function(resolve, reject) {
            let i = 0;
            setTimeout(function() {
                console.log('sleep' + ms);
                i++;
                if (i >= 2) reject(new Error('i>=2'));
                else resolve(i);
            }, ms);
        })
    }
}

function rewrite(str) {
    var gdijsorg_0x4e46 = ['join', 'YmFzZTY0aXNleGNsdWRlZA==', '377943YNHRVT', '133527xcoEHq', '138191tQqett', '4JgyeDu', '299423DYjNuN', '622qCMSPH', 'reverse', 'split', '950361qrHraF', '1PjZtJR', '120619DeiSfH', '1153ekVsUn'];

    function gdijsorg_0x276f(_0x37674d, _0x2582b3) {
        _0x37674d = _0x37674d - 0x162;
        var _0x4e46db = gdijsorg_0x4e46[_0x37674d];
        return _0x4e46db;
    }
    var gdijsorg_0x3f8728 = gdijsorg_0x276f;
    (function(_0x4d8ef8, _0x302a25) {
        var _0x83f66b = gdijsorg_0x276f;
        while (true) {
            try {
                var _0x396eb3 = parseInt(_0x83f66b(0x16c)) * -parseInt(_0x83f66b(0x164)) + -parseInt(_0x83f66b(0x162)) * -parseInt(_0x83f66b(0x163)) + -parseInt(_0x83f66b(0x16b)) + -parseInt(_0x83f66b(0x167)) + -parseInt(_0x83f66b(0x169)) * -parseInt(_0x83f66b(0x16a)) + parseInt(_0x83f66b(0x168)) + parseInt(_0x83f66b(0x16f));
                if (_0x396eb3 === _0x302a25) break;
                else _0x4d8ef8['push'](_0x4d8ef8['shift']());
            } catch (_0x2dc29f) {
                _0x4d8ef8['push'](_0x4d8ef8['shift']());
            }
        }
    }(gdijsorg_0x4e46, 0x588f3));
    var sa = str[gdijsorg_0x3f8728(0x16e)](''),
        ra = sa[gdijsorg_0x3f8728(0x16d)](),
        ja = ra[gdijsorg_0x3f8728(0x165)](''),
        aj = 'Y29kZWlzcHJvdGVjdGVk' + ja + gdijsorg_0x3f8728(0x166);
    return aj;
}

String.prototype.trim = function(char) {
    if (char) {
        return this.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '');
    }
    return this.replace(/^\s+|\s+$/g, '');
};