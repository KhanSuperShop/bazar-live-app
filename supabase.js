// Supabase Unofficial Direct JavaScript Adapter for Khan Super Shop
// Works completely offline without needing external CDN networks

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.supabase = {}));
})(this, function (exports) { 
    'use strict';

    function createClient(supabaseUrl, supabaseKey) {
        // Clean URL to remove trailing slashes
        const url = supabaseUrl.replace(/\/$/, "");

        return {
            from: function (tableName) {
                return {
                    // 1. DATA INSERT (For Admin Page)
                    insert: async function (dataArray) {
                        try {
                            const response = await fetch(`${url}/rest/v1/${tableName}`, {
                                method: 'POST',
                                headers: {
                                    'apikey': supabaseKey,
                                    'Authorization': `Bearer ${supabaseKey}`,
                                    'Content-Type': 'application/json',
                                    'Prefer': 'return=representation'
                                },
                                body: JSON.stringify(dataArray)
                            });

                            if (!response.ok) {
                                const errData = await response.json();
                                return { data: null, error: errData };
                            }

                            const resultData = await response.json();
                            return { data: resultData, error: null };
                        } catch (err) {
                            return { data: null, error: { message: err.message } };
                        }
                    },

                    // 2. DATA FETCH / SELECT (For Index Page)
                    select: async function (columns = '*') {
                        try {
                            const response = await fetch(`${url}/rest/v1/${tableName}?select=${columns}`, {
                                method: 'GET',
                                headers: {
                                    'apikey': supabaseKey,
                                    'Authorization': `Bearer ${supabaseKey}`,
                                    'Content-Type': 'application/json'
                                }
                            });

                            if (!response.ok) {
                                const errData = await response.json();
                                return { data: null, error: errData };
                            }

                            const resultData = await response.json();
                            return { data: resultData, error: null };
                        } catch (err) {
                            return { data: null, error: { message: err.message } };
                        }
                    }
                };
            }
        };
    }

    exports.createClient = createClient;
    Object.defineProperty(exports, '__esModule', { value: true });
});
