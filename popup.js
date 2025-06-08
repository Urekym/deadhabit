class DeadHabitPopup  {



    constructor() {

        /// grab all the important stuff from the HTML

        this.urlList = document.getElementById('urlList');
        this.addUrlBtn = document.getElementById('addUrl');
        this.saveBtn = document.getElementById('saveBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.status = document.getElementById('status');
        
        this.init();    // get this shit started
    }

    async init() {

        //// load the old enemies (blocked sites hehe)

        await this.loadBlockedSites();
        
        /// button go click-click

        this.addUrlBtn.addEventListener('click', () => this.addUrlRow());
        this.saveBtn.addEventListener('click', () => this.saveBlockedSites());
        this.clearAllBtn.addEventListener('click', () => this.clearAllSites());
        
        //// if list is empty, give the user one blank box to start with

        if (this.urlList.children.length === 0) {
            this.addUrlRow();
        }
    }

    async loadBlockedSites() {
        try {

            // ask the browser: “hey, what bad sites do we haaaaaate?”
            const result = await chrome.storage.local.get(['blockedSites']);
            const blockedSites = result.blockedSites || [];

            /// clear the battlefeld

            this.urlList.innerHTML = '';

            /// re-list the enemies (you know)

            blockedSites.forEach(site => {
                this.addUrlRow(site);
            });
            
        } catch (error) {
            console.error('Could not load blocked sites:', error);
            this.showStatus('Oops! Could not load sites 🙃', 'error');
        }
    }

    addUrlRow(value = '') {

        // make a new row with a text box and trash button

        const row = document.createElement('div');
        row.className = 'url-row';
        
        row.innerHTML = `
            <input type="text" class="url-input" placeholder="example.com" value="${value}">
            <button class="delete-btn" title="Remove">🗑️</button>
        `;

        // trash button, makes row go bye bye bsawt gin 

        const deleteBtn = row.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            row.remove();
            if (this.urlList.children.length === 0) {

                this.addUrlRow();       /// don't leave the page empty
            }
        });


        // pressing Enter is clicking save for fast fingers

        const input = row.querySelector('.url-input');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveBlockedSites();
            }
        });

        this.urlList.appendChild(row);

        /// if this is a new row, let's focus it so user can start typing right away, thanks to me hhihi

        if (!value) {
            input.focus();
        }
    }

    getUrlsFromInputs() {
        const inputs = this.urlList.querySelectorAll('.url-input');
        const urls = [];

        inputs.forEach(input => {
            let value = input.value.trim();
            if (value) {


                // clean the mess, no http, no www, no trailing slashes

                let cleanUrl = value.toLowerCase()
                    .replace(/^https?:\/\//, '')
                    .replace(/^www\./, '')
                    .replace(/\/$/, '');
                
                if (cleanUrl) {
                    urls.push(cleanUrl);
                }
            }
        });

        // no clones allowed, duplicates go to jail, makaynch lmza7

        return [...new Set(urls)];
    }

    async saveBlockedSites() {
        try {
            const urls = this.getUrlsFromInputs();

            //// save the list to browser memory 
            await chrome.storage.local.set({ blockedSites: urls });

            /// tell the background guard to block these websites

            chrome.runtime.sendMessage({ 
                action: 'updateBlockedSites', 
                sites: urls 
            });

            this.showStatus(`Saved ${urls.length} bad site(s) 🔒`, 'success');

        } catch (error) {
            console.error('Saving failed:', error);
            this.showStatus('Could not save 😓', 'error');
        }
    }

    async clearAllSites() {

        /// ask the user one last time (just in case they’re being dramatic)

        if (confirm('Really clear all blocked sites? 😬')) {
            try {

                // clear the memory and the UI
                await chrome.storage.local.set({ blockedSites: [] });

                chrome.runtime.sendMessage({ 
                    action: 'updateBlockedSites', 
                    sites: [] 
                });

                this.urlList.innerHTML = '';
                this.addUrlRow();       /// give them a fresh start

                this.showStatus('All gone! Clean slate! 🧹', 'success');

            } catch (error) {
                console.error('Clearing failed:', error);
                this.showStatus('Could not clear sites 😩', 'error');
            }
        }
    }

    showStatus(message, type) {

        /// show a friendly message (for 3 seconds, 3 okay 3)
        
        this.status.textContent = message;
        this.status.className = `status ${type}`;
        this.status.classList.remove('hidden');

        setTimeout(() => {
            this.status.classList.add('hidden');
        }, 3000);
    }
}


//// dom dom dom, PLEASE DO NOT javascripts me

document.addEventListener('DOMContentLoaded', () => {
    new DeadHabitPopup();
});