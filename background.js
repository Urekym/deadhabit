/// i use too much comments, sorry sorry my bad memory, hh nice 9afiya



class DeadHabitBackground {


    constructor() {
        this.init();    /// start the whole blocking magic
    }

    async init() {

        // when popup sends a message (like new sites to block), listen for it

        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'updateBlockedSites') {
                this.updateBlockingRules(message.sites);        /// update the sites we're blocking
            }
        });

            // load blocked sites when extension starts (so it remembers your bad habits)

            await this.loadAndApplyBlockedSites();
    }

    async loadAndApplyBlockedSites() {
        try {

            //// get blocked sites from storage (like memory but cooler)

            const result = await chrome.storage.local.get(['blockedSites']);

            const blockedSites = result.blockedSites || [];     /// if nothing saved, start empty
            await this.updateBlockingRules(blockedSites);       //// start blocking right away
        } catch (error) {
            console.error('Error loading blocked sites on startup:', error);
        }
    }

    async updateBlockingRules(blockedSites) {
        try {
            
            
            /// aa first remove any old rules (clean the table)

            const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
            const existingRuleIds = existingRules.map(rule => rule.id);
            
            if (existingRuleIds.length > 0) {
                await chrome.declarativeNetRequest.updateDynamicRules({
                    removeRuleIds: existingRuleIds
                });
            }

            // now let's create fresh new rules

            const newRules = [];
            
            blockedSites.forEach((site, index) => {

                // rule for all subdomains (like www.bababoy.com, hello.bababoy.com, etc.)

                const rule = {
                    id: index + 1,      //// just giving each rule a unique number
                    priority: 1,        // not too important but let’s say 1 is top
                    action: {
                        type: 'block' /// BLOCK IT
                    },
                    condition: {
                        urlFilter: `*://*.${site}/*`,   /// match the site and subdomains
                        resourceTypes: [        /// block everything (tabs, images, scripts) you name it
                            'main_frame',
                            'sub_frame',
                            'stylesheet',
                            'script',
                            'image',
                            'font',
                            'object',
                            'xmlhttprequest',
                            'ping',
                            'csp_report',
                            'media',
                            'websocket',
                            'webtransport',
                            'webbundle'
                        ]
                    }
                };
                
                newRules.push(rule);
        

                //// a rule for the exact domain too (just in case)

                const exactRule = {
                    id: index + 1000,   /// different ID to avoid crashy boom boomm
                    priority: 1,
                    action: {
                        type: 'block'   /// again BLOCK IT
                    },
                    condition: {
                        urlFilter: `*://${site}/*`,     /// exact domain only
                        resourceTypes: [    /// same, block everything
                            'main_frame',
                            'sub_frame',
                            'stylesheet',
                            'script',
                            'image',
                            'font',
                            'object',
                            'xmlhttprequest',
                            'ping',
                            'csp_report',
                            'media',
                            'websocket',
                            'webtransport',
                            'webbundle'
                        ]
                    }
                };
                
                newRules.push(exactRule);
            });

            ////  ohh finally add the new shiny blocking rules

            if (newRules.length > 0) {
                await chrome.declarativeNetRequest.updateDynamicRules({
                    addRules: newRules
                });
            }

            console.log(`Updated blocking rules for ${blockedSites.length} sites:`, blockedSites);
            
        } catch (error) {
            console.error('Error updating blocking rules:', error);
        }
    }
}

new DeadHabitBackground();
