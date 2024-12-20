// Load JSON data and implement infinite scroll with search
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    const searchInput = document.getElementById('search');
    const raceFilter = document.getElementById('raceFilter');
    const resultsContainer = document.getElementById('results');

    const itemsPerPage = 5; // Number of items to show per load
    let currentPage = 1; // Current page for infinite scroll
    let filteredData = [...data]; // Data to display after filtering

    // Sort matches by date and setOrder
    const sortMatches = (matches) => {
      return matches.sort((a, b) => {
        const dateA = new Date(a.matchDate);
        const dateB = new Date(b.matchDate);

        // Sort by date (ascending)
        if (dateA < dateB) return 1;
        if (dateA > dateB) return -1;

        // If dates are equal, sort by setOrder (descending)
        return b.setOrder - a.setOrder;
      });
    };

    const sortCoaches = (coaches) => {
      return coaches.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    };

    // Render a batch of matches
    const renderMatches = (matches) => {
      matches.forEach(match => {
        const matchDiv = document.createElement('div');
        matchDiv.classList.add('match-card');
        matchDiv.innerHTML = `
          <h2>${match.tournament} _ ${match.round} _ ${match.matchDate}</h2>
          <p><strong>Set:</strong> ${match.setOrder} | <strong>Map:</strong> ${match.map}</p>
          <p><strong>Tier:</strong> ${match.tier}</p>
          
          <div class="winner-section">
            <h3 class="winner">Winner: ${match.winnerTeam} _ ${match.winnerPlayer} (${match.winnerRace})</h3>
            <p><strong>Coaches(asc):</strong> ${sortCoaches(match.winnerCoaches).join(', ')}</p>
            <p><strong>Build:</strong><br>${match.winnerBuild.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div class="loser-section">
            <h3 class="loser">Loser: ${match.loserTeam} _ ${match.loserPlayer} (${match.loserRace})</h3>
            <p><strong>Coaches(asc):</strong> ${sortCoaches(match.loserCoaches).join(', ')}</p>
            <p><strong>Build:</strong><br>${match.loserBuild.replace(/\n/g, '<br>')}</p>
          </div>
          
          <h4>Replay Links:</h4>
          <div class="replay-links">
              ${match.replayLinks
                  .slice(0, 3) // Display the first replay link
                  .map(link => `
                  <div>
                    <p><strong>${link.description}:</strong></p>
                    ${link.iframe}
                  </div>
                `).join('')}
              ${match.replayLinks.length > 1
                  ? `<div class="show-more-container">
                      <button class="show-more">Show More</button>
                    </div>
                    <div class="hidden-links" style="display: none;">
                      ${match.replayLinks.slice(3).map(link => `
                        <div>
                          <p><strong>${link.description}:</strong></p>
                          ${link.iframe}
                        </div>
                      `).join('')}
                    </div>`
                  : ''
                }
            </div>
          `;

          const showMoreButton = matchDiv.querySelector('.show-more');
          if (showMoreButton) {
            showMoreButton.addEventListener('click', () => {
              const hiddenLinks = matchDiv.querySelector('.hidden-links');
              if (hiddenLinks.style.display === 'none') {
                hiddenLinks.style.display = 'block';
                showMoreButton.textContent = 'Show Less';
              } else {
                hiddenLinks.style.display = 'none';
                showMoreButton.textContent = 'Show More';
              }
            });
          }
        resultsContainer.appendChild(matchDiv);
      });
    };

    // Load the next batch of matches
    const loadMoreMatches = () => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      // Get the next batch of matches
      const nextBatch = filteredData.slice(startIndex, endIndex);

      // Render the next batch
      renderMatches(nextBatch);

      // Increment the page counter
      currentPage++;

      // If all items are loaded, remove the scroll event listener
      if (endIndex >= filteredData.length) {
        window.removeEventListener('scroll', handleScroll);
      }
    };

    // Handle scroll event to load more data
    const handleScroll = () => {
      // const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      // Check if user has scrolled to the bottom of the page
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        loadMoreMatches();
      }
    };

    // Filter and update matches based on search input and race filter
    const filterMatches = () => {
      const query = searchInput.value.toLowerCase();
      const selectedRace = raceFilter.value;

      // Filter the data
      filteredData = data.filter(match => {
        const matchesQuery =
          match.winnerPlayer.toLowerCase().includes(query) ||
          match.loserPlayer.toLowerCase().includes(query) ||
          match.winnerCoaches.some(coach => coach.toLowerCase().includes(query)) ||
          match.loserCoaches.some(coach => coach.toLowerCase().includes(query));

        const matchesRace =
          !selectedRace ||
          match.winnerRace === selectedRace ||
          match.loserRace === selectedRace;

        return matchesQuery && matchesRace;
      });

      // Reset the state for rendering
      currentPage = 1;
      resultsContainer.innerHTML = ''; // Clear previous results
      window.addEventListener('scroll', handleScroll, { passive: true }); // Reattach the scroll listener
      loadMoreMatches(); // Load the first batch of filtered data
    };

    // Initial load of matches
    filteredData = sortMatches(data);
    loadMoreMatches();

    // Attach event listeners
    searchInput.addEventListener('input', filterMatches);
    raceFilter.addEventListener('change', filterMatches);
    window.addEventListener('scroll', handleScroll, { passive: true });
  })
  .catch(err => console.error('Error loading data:', err));


