"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const CP = require("child_process");
let subs;
exports.config = {
    command: {
        type: 'string',
        default: 'cat',
    },
    runOnSave: {
        type: 'boolean',
        default: false,
    },
    replaceText: {
        type: 'boolean',
        default: true,
    },
};
function activate() {
    subs = new atom_1.CompositeDisposable();
    subs.add(atom.commands.add('atom-text-editor', {
        'unix-filter:run': ({ currentTarget }) => {
            run(currentTarget.getModel()).catch((e) => {
                console.error(e);
            });
        },
        'unix-filter:exec': async ({ currentTarget }) => {
            const textEditorElement = document.createElement('atom-text-editor');
            textEditorElement.setAttribute('mini', '');
            const panel = atom.workspace.addModalPanel({
                item: textEditorElement,
                visible: true,
            });
            textEditorElement.focus();
            const disp = new atom_1.CompositeDisposable();
            const cont = await new Promise((resolve) => {
                disp.add(atom.commands.add(textEditorElement, {
                    'core:confirm': () => resolve(true),
                    'core:cancel': () => resolve(false),
                }));
            });
            disp.dispose();
            panel.destroy();
            if (cont) {
                const cmd = textEditorElement.getModel().getText();
                customCommand(currentTarget.getModel(), cmd).catch((e) => {
                    console.error(e);
                });
            }
        },
    }), atom.workspace.observeTextEditors((editor) => {
        const buf = editor.getBuffer();
        const disp = new atom_1.CompositeDisposable();
        disp.add(buf.onWillSave(async () => {
            const shouldRun = atom.config.get('unix-filter.runOnSave', {
                scope: editor.getRootScopeDescriptor(),
            });
            if (shouldRun)
                await run(editor);
        }), buf.onDidDestroy(() => {
            subs.remove(disp);
            disp.dispose();
        }));
        subs.add(disp);
    }));
}
exports.activate = activate;
function deactivate() {
    subs.dispose();
}
exports.deactivate = deactivate;
async function run(editor) {
    const cmd = atom.config.get('unix-filter.command', {
        scope: editor.getRootScopeDescriptor(),
    });
    return customCommand(editor, cmd);
}
async function customCommand(editor, cmd) {
    const text = editor.getText();
    return new Promise((resolve) => {
        const newEnv = Object.assign({}, process.env);
        newEnv.FILE = editor.getPath();
        const proc = CP.exec(cmd, { encoding: 'utf8', env: newEnv }, (error, result) => {
            if (error) {
                atom.notifications.addError(error.toString(), {
                    detail: error.message,
                    stack: error.stack,
                    dismissable: true,
                });
                resolve();
            }
            else {
                const [first, ...points] = editor
                    .getCursors()
                    .map((c) => c.getBufferPosition());
                const replaceText = atom.config.get('unix-filter.replaceText', {
                    scope: editor.getRootScopeDescriptor(),
                });
                if (replaceText) {
                    editor.setText(result.replace(/^ +$/gm, ''));
                    editor.setCursorBufferPosition(first);
                    points.forEach((p) => editor.addCursorAtBufferPosition(p));
                }
                resolve();
            }
        });
        proc.stdin.write(text);
        proc.stdin.end();
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQXNEO0FBQ3RELG9DQUFtQztBQUVuQyxJQUFJLElBQXlCLENBQUE7QUFFaEIsUUFBQSxNQUFNLEdBQUc7SUFDcEIsT0FBTyxFQUFFO1FBQ1AsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsS0FBSztLQUNmO0lBQ0QsU0FBUyxFQUFFO1FBQ1QsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztLQUNmO0lBQ0QsV0FBVyxFQUFFO1FBQ1gsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtLQUNkO0NBQ0YsQ0FBQTtBQUVEO0lBQ0UsSUFBSSxHQUFHLElBQUksMEJBQW1CLEVBQUUsQ0FBQTtJQUNoQyxJQUFJLENBQUMsR0FBRyxDQUNOLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFO1FBQ3BDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFO1lBQ3ZDLEdBQUcsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDeEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNsQixDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUM7UUFFRCxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFO1lBQzlDLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO1lBQ3BFLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUE7WUFDMUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7Z0JBQ3pDLElBQUksRUFBRSxp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QUFBO2FBQ1Y7UUFDSCxDQUFDLENBQ0YsQ0FBQTtRQUNELElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3RCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUE7SUFDbEIsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgVGV4dEVkaXRvciB9IGZyb20gJ2F0b20nXG5pbXBvcnQgKiBhcyBDUCBmcm9tICdjaGlsZF9wcm9jZXNzJ1xuXG5sZXQgc3ViczogQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuICBjb21tYW5kOiB7XG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ2NhdCcsXG4gIH0sXG4gIHJ1bk9uU2F2ZToge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgfSxcbiAgcmVwbGFjZVRleHQ6IHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgfSxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xuICBzdWJzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICBzdWJzLmFkZChcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICd1bml4LWZpbHRlcjpydW4nOiAoeyBjdXJyZW50VGFyZ2V0IH0pID0+IHtcbiAgICAgICAgcnVuKGN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGUpXG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgLy8gVE9ETzogYXRvbS1zZWxlY3QtbGlzdCB3aXRoIGhpc3RvcnlcbiAgICAgICd1bml4LWZpbHRlcjpleGVjJzogYXN5bmMgKHsgY3VycmVudFRhcmdldCB9KSA9PiB7XG4gICAgICAgIGNvbnN0IHRleHRFZGl0b3JFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXRvbS10ZXh0LWVkaXRvcicpXG4gICAgICAgIHRleHRFZGl0b3JFbGVtZW50LnNldEF0dHJpYnV0ZSgnbWluaScsICcnKVxuICAgICAgICBjb25zdCBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoe1xuICAgICAgICAgIGl0ZW06IHRleHRFZGl0b3JFbGVtZW50LFxuICAgICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgIH0pXG4gICAgICAgIHRleHRFZGl0b3JFbGVtZW50LmZvY3VzKClcbiAgICAgICAgY29uc3QgZGlzcCA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICAgICAgY29uc3QgY29udCA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgZGlzcC5hZGQoXG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmFkZCh0ZXh0RWRpdG9yRWxlbWVudCwge1xuICAgICAgICAgICAgICAnY29yZTpjb25maXJtJzogKCkgPT4gcmVzb2x2ZSh0cnVlKSxcbiAgICAgICAgICAgICAgJ2NvcmU6Y2FuY2VsJzogKCkgPT4gcmVzb2x2ZShmYWxzZSksXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICApXG4gICAgICAgIH0pXG4gICAgICAgIGRpc3AuZGlzcG9zZSgpXG4gICAgICAgIHBhbmVsLmRlc3Ryb3koKVxuICAgICAgICBpZiAoY29udCkge1xuICAgICAgICAgIGNvbnN0IGNtZCA9IHRleHRFZGl0b3JFbGVtZW50LmdldE1vZGVsKCkuZ2V0VGV4dCgpXG4gICAgICAgICAgY3VzdG9tQ29tbWFuZChjdXJyZW50VGFyZ2V0LmdldE1vZGVsKCksIGNtZCkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSlcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pLFxuICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycygoZWRpdG9yKSA9PiB7XG4gICAgICBjb25zdCBidWYgPSBlZGl0b3IuZ2V0QnVmZmVyKClcbiAgICAgIGNvbnN0IGRpc3AgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgICBkaXNwLmFkZChcbiAgICAgICAgYnVmLm9uV2lsbFNhdmUoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHNob3VsZFJ1biA9IGF0b20uY29uZmlnLmdldCgndW5peC1maWx0ZXIucnVuT25TYXZlJywge1xuICAgICAgICAgICAgc2NvcGU6IGVkaXRvci5nZXRSb290U2NvcGVEZXNjcmlwdG9yKCksXG4gICAgICAgICAgfSlcbiAgICAgICAgICBpZiAoc2hvdWxkUnVuKSBhd2FpdCBydW4oZWRpdG9yKVxuICAgICAgICB9KSxcbiAgICAgICAgYnVmLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgICAgc3Vicy5yZW1vdmUoZGlzcClcbiAgICAgICAgICBkaXNwLmRpc3Bvc2UoKVxuICAgICAgICB9KSxcbiAgICAgIClcbiAgICAgIHN1YnMuYWRkKGRpc3ApXG4gICAgfSksXG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIHN1YnMuZGlzcG9zZSgpXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJ1bihlZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgY29uc3QgY21kID0gYXRvbS5jb25maWcuZ2V0KCd1bml4LWZpbHRlci5jb21tYW5kJywge1xuICAgIHNjb3BlOiBlZGl0b3IuZ2V0Um9vdFNjb3BlRGVzY3JpcHRvcigpLFxuICB9KVxuICByZXR1cm4gY3VzdG9tQ29tbWFuZChlZGl0b3IsIGNtZClcbn1cblxuYXN5bmMgZnVuY3Rpb24gY3VzdG9tQ29tbWFuZChlZGl0b3I6IFRleHRFZGl0b3IsIGNtZDogc3RyaW5nKSB7XG4gIGNvbnN0IHRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpXG4gIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgIGNvbnN0IG5ld0VudiA9IE9iamVjdC5hc3NpZ24oe30sIHByb2Nlc3MuZW52KVxuICAgIG5ld0Vudi5GSUxFID0gZWRpdG9yLmdldFBhdGgoKVxuICAgIGNvbnN0IHByb2MgPSBDUC5leGVjKFxuICAgICAgY21kLFxuICAgICAgeyBlbmNvZGluZzogJ3V0ZjgnLCBlbnY6IG5ld0VudiB9LFxuICAgICAgKGVycm9yLCByZXN1bHQpID0+IHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGVycm9yLnRvU3RyaW5nKCksIHtcbiAgICAgICAgICAgIGRldGFpbDogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgcmVzb2x2ZSgpIC8vIGFsd2F5cyBzYXZlIHRoZSBmaWxlIVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IFtmaXJzdCwgLi4ucG9pbnRzXSA9IGVkaXRvclxuICAgICAgICAgICAgLmdldEN1cnNvcnMoKVxuICAgICAgICAgICAgLm1hcCgoYykgPT4gYy5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgICAgIGNvbnN0IHJlcGxhY2VUZXh0ID0gYXRvbS5jb25maWcuZ2V0KCd1bml4LWZpbHRlci5yZXBsYWNlVGV4dCcsIHtcbiAgICAgICAgICAgIHNjb3BlOiBlZGl0b3IuZ2V0Um9vdFNjb3BlRGVzY3JpcHRvcigpLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgaWYgKHJlcGxhY2VUZXh0KSB7XG4gICAgICAgICAgICBlZGl0b3Iuc2V0VGV4dChyZXN1bHQucmVwbGFjZSgvXiArJC9nbSwgJycpKVxuICAgICAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKGZpcnN0KVxuICAgICAgICAgICAgcG9pbnRzLmZvckVhY2goKHApID0+IGVkaXRvci5hZGRDdXJzb3JBdEJ1ZmZlclBvc2l0aW9uKHApKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApXG4gICAgcHJvYy5zdGRpbi53cml0ZSh0ZXh0KVxuICAgIHByb2Muc3RkaW4uZW5kKClcbiAgfSlcbn1cbiJdfQ==