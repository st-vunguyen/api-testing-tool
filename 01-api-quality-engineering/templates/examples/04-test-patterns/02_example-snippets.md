# Example Snippets

## Status assertion snippet

```javascript
pm.test('status is expected', function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201, 204]);
});
```

## Capture ID snippet

```javascript
const data = pm.response.json();
if (data.id) {
  pm.environment.set('RESOURCE_ID', data.id);
}
```

## Variable contract row example

```markdown
| `RESOURCE_ID` | Optional | Create response | `POST /resources` | `GET /resources/{id}` | Rename per real domain |
```
