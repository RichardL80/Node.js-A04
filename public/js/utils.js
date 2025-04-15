function handleDelete(event, projectId) {
  event.preventDefault();
  if (confirm('Are you sure you want to delete this project?')) {
    fetch(`/projects/${projectId}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to delete the project');
        }
      })
      .then((data) => {
      //   alert(data.message);
        window.location.reload(); // Reload the page to reflect changes
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred while deleting the project');
      });
  }
}

export { handleDelete };
