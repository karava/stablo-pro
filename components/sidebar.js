export default function Sidebar(props) {
  return (
    <div>
      Sidebar
      <Searchbar />
    </div>
  );
}

function Searchbar() {
  return (
    <div>
      <form action="/search" method="GET">
        <input
          type="search"
          name="q"
          id="q"
          className="w-full px-3 py-2 border"
        />
      </form>
    </div>
  );
}
