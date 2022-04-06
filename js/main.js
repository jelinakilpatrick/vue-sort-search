new Vue({
    el: '#app',
    data: function() {
        return {
            loaded: false,
            error: false,
            data: [],
			search: '',
			searchResults: '',
			currentSort: 'date',
			currentSortDir: 'asc',
			pageSize: 10,
			page: 0,
			totalPages: 0
		}
    },
    created() {
        let vm = this;

        fetch('data.json')
            .then(async response => {
                const data = await response.json();
        
                // Check for error response.
                if (!response.ok) {
        
                    // Get error message from body or default to response statusText.
                    const error = (data && data.message) || response.statusText;
                    return Promise.reject(error);
                }
        
                vm.data = data;
            })
            .catch(error => {
                vm.errorMessage = error;
                console.error('There was an error loading the JSON data.', error);
            })
            .finally(() => {
                vm.loaded = true;
            });
    },
    methods: {
        sort: function(s) {
          
          // Whatever the current sort is, reverse it.
          if(s === this.currentSort) {
            this.currentSortDir = this.currentSortDir === 'asc' ? 'desc' : 'asc';
          }
          this.currentSort = s;
        },
        setPage(page) {
          this.page = page-1;
        }
    },
    computed: {
        sortSearchPaginate: function() {
            let vm = this;

            // We need the processed data reset to the original data each time.
            let processedData = vm.data;

            // Do the search.
            if (vm.search !== '' && vm.search) {
                processedData = processedData.filter(item => {
                    return item.company.toLowerCase().includes(vm.search.toLowerCase()) ||
                    item.contact.toLowerCase().includes(vm.search.toLowerCase()) ||
            		item.address.toLowerCase().includes(vm.search.toLowerCase());
                });

                // So we can show how many results for the search term were found.
                vm.searchResults = processedData.length;
            }

            // Do the column sorting.
            if (vm.currentSort === 'date') {
                processedData = processedData.sort((a, b) => {
                    
                    // This is the wrong way around on purpose. If desc is set by default, it will be confusing to click other columns (as you'll click and it'll show you z-a). Making it the "wrong" way around for the date will fix that.
                    if (this.currentSortDir === 'asc') {
                        return new Date(b.date) - new Date(a.date);
                    }
                    else {
                        return new Date(a.date) - new Date(b.date);
                    }
                });
            }
            else {
                processedData = processedData.sort((a, b) => {
                    let modifier = 1;
                    if (this.currentSortDir === 'desc') modifier = -1;
                    if (a[this.currentSort] < b[this.currentSort]) return -1 * modifier;
                    if (a[this.currentSort] > b[this.currentSort]) return 1 * modifier;
                    return 0;
                });
            }

            // Get the total number of pages (rounding up).
            vm.totalPages = Math.ceil(processedData.length/this.pageSize);

            // Divide the processed data up into pages.
            let pageData = processedData.slice(this.page*this.pageSize, this.pageSize * this.page + this.pageSize);

            return pageData;
        }
    }
});